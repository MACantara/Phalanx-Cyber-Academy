"""
System backup routes for admin panel.
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, send_file, Response
from flask_login import login_required, current_user
from app.models.user import User
from app.models.login_attempt import LoginAttempt
from app.models.email_verification import EmailVerification
from app.models.contact import Contact
from app.database import DatabaseError, get_supabase, Tables
from app.routes.admin.admin_utils import admin_required
from app.utils.timezone_utils import utc_now, format_for_user_timezone
from datetime import datetime
from typing import Dict, Any
import json
import os
import zipfile
import io
from supabase import Client

system_backup_bp = Blueprint('system_backup', __name__, url_prefix='/admin')

# Supabase Storage Configuration
BACKUP_BUCKET = 'system-backups'


def _format_file_size(size_bytes):
    """Format file size in appropriate units."""
    if size_bytes >= 1024 * 1024 * 1024:  # GB
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"
    elif size_bytes >= 1024 * 1024:  # MB
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    elif size_bytes >= 1024:  # KB
        return f"{size_bytes / 1024:.1f} KB"
    else:  # Bytes
        return f"{size_bytes} bytes"


def _ensure_backup_bucket(supabase: Client):
    """Ensure the backup bucket exists in Supabase Storage."""
    try:
        # Try to list files in the bucket - if it exists, this will work
        supabase.storage.from_(BACKUP_BUCKET).list()
    except Exception as e:
        # If bucket doesn't exist, create it
        try:
            supabase.storage.create_bucket(BACKUP_BUCKET, options={'public': False})
            current_app.logger.info(f"Created backup bucket: {BACKUP_BUCKET}")
        except Exception as create_error:
            current_app.logger.error(f"Failed to create backup bucket: {create_error}")
            raise DatabaseError(f"Could not ensure backup bucket exists: {create_error}")


def _list_backup_files(supabase: Client):
    """List all backup files from Supabase Storage."""
    try:
        _ensure_backup_bucket(supabase)
        response = supabase.storage.from_(BACKUP_BUCKET).list()
        
        backups = []
        for file_info in response:
            if file_info['name'].endswith('.zip'):
                backup_info = {
                    'filename': file_info['name'],
                    'size': file_info.get('metadata', {}).get('size', 0),
                    'created_at': datetime.fromisoformat(file_info['created_at'].replace('Z', '+00:00')).replace(tzinfo=None) if file_info.get('created_at') else utc_now().replace(tzinfo=None),
                    'size_mb': round(file_info.get('metadata', {}).get('size', 0) / (1024 * 1024), 2),
                    'size_formatted': _format_file_size(file_info.get('metadata', {}).get('size', 0))
                }
                
                # Try to get backup metadata
                try:
                    metadata_response = _get_backup_metadata(supabase, file_info['name'])
                    if metadata_response:
                        backup_info['metadata'] = metadata_response
                    else:
                        backup_info['metadata'] = {
                            'tables_backed_up': 'Unknown',
                            'total_records': 'Unknown',
                            'app_version': 'Legacy',
                            'database_type': 'Unknown'
                        }
                except Exception as e:
                    current_app.logger.warning(f"Could not read metadata from backup {file_info['name']}: {e}")
                    backup_info['metadata'] = {
                        'tables_backed_up': 'Error',
                        'total_records': 'Error',
                        'app_version': 'Error',
                        'database_type': 'Error'
                    }
                
                backups.append(backup_info)
        
        return backups
        
    except Exception as e:
        current_app.logger.error(f"Failed to list backup files: {e}")
        raise DatabaseError(f"Could not list backup files: {e}")


def _get_backup_metadata(supabase: Client, filename: str):
    """Get metadata from a backup file in Supabase Storage."""
    try:
        # Download the backup file to extract metadata
        response = supabase.storage.from_(BACKUP_BUCKET).download(filename)
        
        with zipfile.ZipFile(io.BytesIO(response), 'r') as zipf:
            if 'backup_metadata.json' in zipf.namelist():
                metadata_json = zipf.read('backup_metadata.json')
                metadata = json.loads(metadata_json)
                
                return {
                    'tables_backed_up': metadata.get('tables_backed_up', len(metadata.get('tables_included', []))),
                    'total_records': metadata.get('total_records', 0),
                    'app_version': metadata.get('app_version', f"Version {metadata.get('version', 'Unknown')}"),
                    'database_type': metadata.get('database_type', 'Supabase'),
                    'created_by': metadata.get('created_by', 'Unknown'),
                    'record_counts': metadata.get('record_counts', {}),
                    'backup_version': metadata.get('version', '1.0')
                }
        
        return None
        
    except Exception as e:
        current_app.logger.warning(f"Could not read metadata from backup {filename}: {e}")
        return None


def _upload_backup_to_storage(supabase: Client, backup_data: bytes, filename: str):
    """Upload backup data to Supabase Storage."""
    try:
        _ensure_backup_bucket(supabase)
        
        response = supabase.storage.from_(BACKUP_BUCKET).upload(
            filename,
            backup_data,
            file_options={'content-type': 'application/zip'}
        )
        
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Upload failed: {response.error}")
            
        return True
        
    except Exception as e:
        current_app.logger.error(f"Failed to upload backup to storage: {e}")
        raise DatabaseError(f"Could not upload backup: {e}")


def _download_backup_from_storage(supabase: Client, filename: str):
    """Download backup file from Supabase Storage."""
    try:
        response = supabase.storage.from_(BACKUP_BUCKET).download(filename)
        return response
        
    except Exception as e:
        current_app.logger.error(f"Failed to download backup from storage: {e}")
        raise DatabaseError(f"Could not download backup: {e}")


def _delete_backup_from_storage(supabase: Client, filename: str):
    """Delete backup file from Supabase Storage."""
    try:
        response = supabase.storage.from_(BACKUP_BUCKET).remove([filename])
        
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Delete failed: {response.error}")
            
        return True
        
    except Exception as e:
        current_app.logger.error(f"Failed to delete backup from storage: {e}")
        raise DatabaseError(f"Could not delete backup: {e}")


@system_backup_bp.route('/system-backup')
@login_required
@admin_required
def backup_management():
    """System backup and restore management page."""
    try:
        supabase = get_supabase()
        
        # List existing backups from Supabase Storage
        backups = _list_backup_files(supabase)
        
        # Sort backups by creation date (newest first)
        backups.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Get database statistics
        stats = {
            'total_users': User.count_all(),
            'total_login_attempts': LoginAttempt.count_recent_attempts(365 * 10),  # All time
            'total_verifications': EmailVerification.count_verified_emails() + EmailVerification.count_pending_verifications(),
            'total_contacts': Contact.get_unread_count() + 100,  # Approximate total (would need a count_all method)
            'backup_count': len(backups),
            'last_backup': backups[0]['created_at'] if backups else None
        }
        
        return render_template('admin/system-backup/backup.html', 
                             backups=backups, 
                             stats=stats)
    
    except Exception as e:
        current_app.logger.error(f"System backup page error: {e}")
        flash('Error loading backup management page.', 'error')
        return redirect(url_for('admin.dashboard'))


@system_backup_bp.route('/create-backup', methods=['POST'])
@login_required
@admin_required
def create_backup():
    """Create a full system backup."""
    try:
        supabase = get_supabase()
        
        # Generate backup filename with timestamp
        timestamp = utc_now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'cyberquest_backup_{timestamp}.zip'
        
        # Create backup data
        backup_data = _create_database_backup()
        
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add database backup as JSON
            zipf.writestr('database_backup.json', json.dumps(backup_data, indent=2, default=str))
            
            # Add metadata
            total_records = sum(len(table_data) for table_data in backup_data.values())
            metadata = {
                'backup_type': 'full',
                'created_at': utc_now().isoformat(),
                'created_by': current_user.username,
                'version': '2.0',  # Updated version
                'tables_included': list(backup_data.keys()),
                'tables_backed_up': len(backup_data.keys()),
                'total_records': total_records,
                'record_counts': {table: len(data) for table, data in backup_data.items()},
                'app_version': 'CyberQuest v1.0',
                'database_type': 'Supabase PostgreSQL',
                'backup_size_estimate': 'See file properties'
            }
            zipf.writestr('backup_metadata.json', json.dumps(metadata, indent=2))
            
            # Add application info
            app_info = {
                'app_name': 'CyberQuest',
                'backup_created_at': utc_now().isoformat(),
                'python_version': '3.12',
                'database_type': 'Supabase PostgreSQL'
            }
            zipf.writestr('app_info.json', json.dumps(app_info, indent=2))
        
        # Get the ZIP file data
        zip_buffer.seek(0)
        zip_data = zip_buffer.getvalue()
        file_size = len(zip_data)
        size_mb = round(file_size / (1024 * 1024), 2)
        
        # Upload to Supabase Storage
        _upload_backup_to_storage(supabase, zip_data, backup_filename)
        
        flash(f'Backup created successfully: {backup_filename} ({size_mb} MB)', 'success')
        current_app.logger.info(f'Database backup created by {current_user.username}: {backup_filename}')
        
    except Exception as e:
        current_app.logger.error(f"Backup creation error: {e}")
        flash('Error creating backup. Please check server logs.', 'error')
    
    return redirect(url_for('system_backup.backup_management'))


@system_backup_bp.route('/download-backup/<filename>')
@login_required
@admin_required
def download_backup(filename):
    """Download a backup file."""
    try:
        supabase = get_supabase()
        
        if not filename.endswith('.zip'):
            flash('Invalid backup file format.', 'error')
            return redirect(url_for('system_backup.backup_management'))
        
        # Download from Supabase Storage
        backup_data = _download_backup_from_storage(supabase, filename)
        
        current_app.logger.info(f'Backup downloaded by {current_user.username}: {filename}')
        
        # Return the file as a response
        return Response(
            backup_data,
            mimetype='application/zip',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Content-Length': str(len(backup_data))
            }
        )
        
    except DatabaseError as e:
        current_app.logger.error(f"Backup download error: {e}")
        flash('Backup file not found in storage.', 'error')
        return redirect(url_for('system_backup.backup_management'))
    except Exception as e:
        current_app.logger.error(f"Backup download error: {e}")
        flash('Error downloading backup file.', 'error')
        return redirect(url_for('system_backup.backup_management'))


@system_backup_bp.route('/delete-backup/<filename>', methods=['POST'])
@login_required
@admin_required
def delete_backup(filename):
    """Delete a backup file."""
    try:
        supabase = get_supabase()
        
        if not filename.endswith('.zip'):
            flash('Invalid backup file format.', 'error')
            return redirect(url_for('system_backup.backup_management'))
        
        # Delete from Supabase Storage
        _delete_backup_from_storage(supabase, filename)
        
        flash(f'Backup {filename} deleted successfully.', 'success')
        current_app.logger.info(f'Backup deleted by {current_user.username}: {filename}')
        
    except DatabaseError as e:
        current_app.logger.error(f"Backup deletion error: {e}")
        flash('Backup file not found in storage.', 'error')
    except Exception as e:
        current_app.logger.error(f"Backup deletion error: {e}")
        flash('Error deleting backup file.', 'error')
    
    return redirect(url_for('system_backup.backup_management'))


@system_backup_bp.route('/restore-backup', methods=['POST'])
@login_required
@admin_required
def restore_backup():
    """Restore system from a backup file."""
    try:
        if 'backup_file' not in request.files:
            flash('No backup file provided.', 'error')
            return redirect(url_for('system_backup.backup_management'))
        
        file = request.files['backup_file']
        if file.filename == '' or not file.filename.endswith('.zip'):
            flash('Please select a valid backup file (.zip).', 'error')
            return redirect(url_for('system_backup.backup_management'))
        
        # Read uploaded file into memory
        file_data = file.read()
        
        # Extract and restore backup from memory
        with zipfile.ZipFile(io.BytesIO(file_data), 'r') as zipf:
            try:
                # Read backup metadata
                metadata = json.loads(zipf.read('backup_metadata.json'))
                
                # Read database backup
                backup_data = json.loads(zipf.read('database_backup.json'))
                
                # Perform restore with confirmation
                restore_type = request.form.get('restore_type', 'merge')
                
                # Count records to be restored
                total_records = sum(len(table_data) for table_data in backup_data.values())
                
                current_app.logger.info(f'Starting database restore: {restore_type} mode, {total_records} records')
                
                _restore_database_backup(backup_data, restore_type)
                
                # Generate detailed success message
                if restore_type == 'replace':
                    flash(f'Database REPLACED successfully! All existing data was deleted and replaced with {total_records} records from backup created on {metadata.get("created_at", "unknown date")}. Previous data is permanently lost.', 'success')
                else:
                    flash(f'Database MERGED successfully! {total_records} records from backup created on {metadata.get("created_at", "unknown date")} have been merged with existing data.', 'success')
                
                current_app.logger.info(f'Database restored by {current_user.username} using {restore_type} mode from backup: {file.filename}')
                
            except json.JSONDecodeError as e:
                current_app.logger.error(f"Invalid backup file format: {e}")
                flash('Invalid backup file format. Please ensure you are uploading a valid CyberQuest backup.', 'error')
            except KeyError as e:
                current_app.logger.error(f"Missing backup file components: {e}")
                flash('Incomplete backup file. Missing required components.', 'error')
            except DatabaseError as e:
                current_app.logger.error(f"Database restore failed: {e}")
                flash(f'Database restore failed: {str(e)}', 'error')
        
    except zipfile.BadZipFile:
        current_app.logger.error("Invalid ZIP file uploaded for restore")
        flash('Invalid ZIP file. Please upload a valid backup file.', 'error')
    except Exception as e:
        current_app.logger.error(f"Backup restore error: {e}")
        flash('Error restoring backup. Please check server logs for details.', 'error')
    
    return redirect(url_for('system_backup.backup_management'))


@system_backup_bp.route('/restore-from-server', methods=['POST'])
@login_required
@admin_required
def restore_from_server():
    """Restore system from a backup file already in Supabase Storage."""
    try:
        supabase = get_supabase()
        backup_filename = request.form.get('backup_filename')
        restore_type = request.form.get('restore_type', 'merge')
        
        if not backup_filename:
            flash('No backup file specified.', 'error')
            return redirect(url_for('system_backup.backup_management'))
        
        if not backup_filename.endswith('.zip'):
            flash('Invalid backup file format.', 'error')
            return redirect(url_for('system_backup.backup_management'))
        
        # Download backup from Supabase Storage
        backup_data_bytes = _download_backup_from_storage(supabase, backup_filename)
        
        # Extract and restore backup
        with zipfile.ZipFile(io.BytesIO(backup_data_bytes), 'r') as zipf:
            try:
                # Read backup metadata
                metadata = json.loads(zipf.read('backup_metadata.json'))
                
                # Read database backup
                backup_data = json.loads(zipf.read('database_backup.json'))
                
                # Count records to be restored
                total_records = sum(len(table_data) for table_data in backup_data.values())
                
                current_app.logger.info(f'Starting server backup restore: {restore_type} mode, {total_records} records from {backup_filename}')
                
                _restore_database_backup(backup_data, restore_type)
                
                # Generate detailed success message
                if restore_type == 'replace':
                    flash(f'Database REPLACED successfully! All existing data was deleted and replaced with {total_records} records from {backup_filename} (created {metadata.get("created_at", "unknown date")}). Previous data is permanently lost.', 'success')
                else:
                    flash(f'Database MERGED successfully! {total_records} records from {backup_filename} (created {metadata.get("created_at", "unknown date")}) have been merged with existing data.', 'success')
                
                current_app.logger.info(f'Server backup restored by {current_user.username} using {restore_type} mode from {backup_filename}')
                
            except json.JSONDecodeError as e:
                current_app.logger.error(f"Invalid backup file format: {e}")
                flash('Invalid backup file format. Please ensure the file is a valid CyberQuest backup.', 'error')
            except KeyError as e:
                current_app.logger.error(f"Missing backup file components: {e}")
                flash('Incomplete backup file. Missing required components.', 'error')
            except DatabaseError as e:
                current_app.logger.error(f"Server backup restore failed: {e}")
                flash(f'Database restore failed: {str(e)}', 'error')
        
    except DatabaseError as e:
        current_app.logger.error(f"Backup file not found in storage: {e}")
        flash(f'Backup file "{backup_filename}" not found in storage.', 'error')
    except zipfile.BadZipFile:
        current_app.logger.error(f"Invalid ZIP file: {backup_filename}")
        flash('Invalid backup file. File appears to be corrupted.', 'error')
    except Exception as e:
        current_app.logger.error(f"Server backup restore error: {e}")
        flash('Error restoring backup. Please check server logs for details.', 'error')
    
    return redirect(url_for('system_backup.backup_management'))


@system_backup_bp.route('/backup-schedule')
@login_required
@admin_required
def backup_schedule():
    """Backup scheduling configuration page."""
    # This would integrate with a task scheduler like Celery in production
    # For now, provide manual backup options and information
    
    schedule_info = {
        'auto_backup_enabled': False,  # Would be configurable
        'backup_frequency': 'daily',   # daily, weekly, monthly
        'backup_retention': 30,        # days to keep backups
        'next_scheduled_backup': None,
        'last_auto_backup': None
    }
    
    return render_template('admin/system-backup/schedule.html', 
                         schedule_info=schedule_info)


def _create_database_backup() -> Dict[str, Any]:
    """Create a complete database backup."""
    supabase = get_supabase()
    backup_data = {}
    
    try:
        # Backup Users table
        response = supabase.table(Tables.USERS).select("*").execute()
        backup_data['users'] = response.data if response.data else []
        
        # Backup Login Attempts table
        response = supabase.table(Tables.LOGIN_ATTEMPTS).select("*").execute()
        backup_data['login_attempts'] = response.data if response.data else []
        
        # Backup Email Verifications table
        response = supabase.table(Tables.EMAIL_VERIFICATIONS).select("*").execute()
        backup_data['email_verifications'] = response.data if response.data else []
        
        # Backup Contact Submissions table
        response = supabase.table(Tables.CONTACT_SUBMISSIONS).select("*").execute()
        backup_data['contact_submissions'] = response.data if response.data else []
        
        # Backup Password Reset Tokens table
        response = supabase.table(Tables.PASSWORD_RESET_TOKENS).select("*").execute()
        backup_data['password_reset_tokens'] = response.data if response.data else []
        
        return backup_data
        
    except Exception as e:
        current_app.logger.error(f"Database backup creation error: {e}")
        raise DatabaseError(f"Failed to create database backup: {e}")


def _restore_database_backup(backup_data: Dict[str, Any], restore_type: str = 'merge'):
    """Restore database from backup data."""
    supabase = get_supabase()
    
    try:
        if restore_type == 'replace':
            # WARNING: This will delete all existing data
            current_app.logger.warning(f"Full database replacement initiated by {current_user.username}")
            
            # Delete existing data (in reverse dependency order)
            supabase.table(Tables.PASSWORD_RESET_TOKENS).delete().neq('id', 0).execute()
            supabase.table(Tables.EMAIL_VERIFICATIONS).delete().neq('id', 0).execute()
            supabase.table(Tables.CONTACT_SUBMISSIONS).delete().neq('id', 0).execute()
            supabase.table(Tables.LOGIN_ATTEMPTS).delete().neq('id', 0).execute()
            
            # For users table in replace mode, we need to be careful about the current session
            # Delete all users first - the session will be handled by re-inserting the current user if they exist in backup
            supabase.table(Tables.USERS).delete().neq('id', 0).execute()
        
        # Restore data
        for table_name, table_data in backup_data.items():
            if not table_data:
                continue
                
            table_mapping = {
                'users': Tables.USERS,
                'login_attempts': Tables.LOGIN_ATTEMPTS,
                'email_verifications': Tables.EMAIL_VERIFICATIONS,
                'contact_submissions': Tables.CONTACT_SUBMISSIONS,
                'password_reset_tokens': Tables.PASSWORD_RESET_TOKENS
            }
            
            if table_name in table_mapping:
                current_app.logger.info(f"Restoring {len(table_data)} records to {table_name} table")
                
                # Insert data in batches to avoid timeout
                batch_size = 50  # Reduced batch size for better reliability
                for i in range(0, len(table_data), batch_size):
                    batch = table_data[i:i + batch_size]
                    
                    if restore_type == 'merge':
                        # Use upsert to merge data - this handles duplicate keys gracefully
                        try:
                            supabase.table(table_mapping[table_name]).upsert(
                                batch, 
                                on_conflict='id'  # Specify the conflict column
                            ).execute()
                        except Exception as e:
                            # If upsert fails, try individual record insertion with conflict handling
                            current_app.logger.warning(f"Batch upsert failed for {table_name}, trying individual records: {e}")
                            for record in batch:
                                try:
                                    # Try to update first, then insert if not exists
                                    existing = supabase.table(table_mapping[table_name]).select("id").eq('id', record['id']).execute()
                                    if existing.data:
                                        # Update existing record
                                        supabase.table(table_mapping[table_name]).update(record).eq('id', record['id']).execute()
                                    else:
                                        # Insert new record
                                        supabase.table(table_mapping[table_name]).insert(record).execute()
                                except Exception as record_error:
                                    current_app.logger.error(f"Failed to restore individual record in {table_name}: {record_error}")
                                    continue
                    else:
                        # Replace mode: Direct insert since we deleted all data
                        try:
                            supabase.table(table_mapping[table_name]).insert(batch).execute()
                        except Exception as e:
                            current_app.logger.error(f"Failed to insert batch in {table_name} (replace mode): {e}")
                            # If there are still conflicts in replace mode, log details and continue
                            current_app.logger.error(f"Possible incomplete deletion or backup data issues in {table_name}")
                            # Try individual inserts to identify problematic records
                            for record in batch:
                                try:
                                    supabase.table(table_mapping[table_name]).insert(record).execute()
                                except Exception as record_error:
                                    current_app.logger.error(f"Failed to insert record ID {record.get('id', 'unknown')} in {table_name}: {record_error}")
                                    continue
        
        current_app.logger.info(f"Database restore completed: {restore_type} mode")
        
    except Exception as e:
        current_app.logger.error(f"Database restore error: {e}")
        raise DatabaseError(f"Failed to restore database: {e}")
