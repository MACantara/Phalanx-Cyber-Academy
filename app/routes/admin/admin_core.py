"""
Core admin routes for admin panel.
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, jsonify
from flask_login import login_required, current_user
from app.models.user import User
from app.models.login_attempt import LoginAttempt
from app.models.email_verification import EmailVerification
from app.models.contact import Contact
from app.database import DatabaseError
from app.routes.admin.admin_utils import admin_required
from app.utils.timezone_utils import utc_now, format_for_user_timezone

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/')
@login_required
@admin_required
def dashboard():
    """Admin dashboard with overview statistics."""
    try:
        # Get statistics
        total_users = User.count_all()
        active_users = User.count_active()
        inactive_users = total_users - active_users
        
        # Recent user registrations (last 30 days)
        recent_registrations = User.count_recent_registrations(30)
        
        # Login attempts statistics (last 24 hours)
        recent_login_attempts = LoginAttempt.count_recent_attempts(24)
        failed_login_attempts = LoginAttempt.count_failed_attempts(24)
        
        # Email verification statistics
        verified_emails = User.count_verified_emails()
        pending_verifications = EmailVerification.count_pending_verifications()
        
        # Contact form submissions (last 30 days)
        recent_contacts = Contact.count_recent_submissions(30)
        
        # Recent activities
        recent_users, _ = User.get_all_users(page=1, per_page=5)
        recent_login_logs = LoginAttempt.get_recent_attempts(10)
        
        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'recent_registrations': recent_registrations,
            'recent_login_attempts': recent_login_attempts,
            'failed_login_attempts': failed_login_attempts,
            'verified_emails': verified_emails,
            'pending_verifications': pending_verifications,
            'recent_contacts': recent_contacts
        }
        
        return render_template('admin/dashboard/dashboard.html', 
                             stats=stats, 
                             recent_users=recent_users,
                             recent_login_logs=recent_login_logs)
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin dashboard error: {e}")
        flash('Error loading dashboard data.', 'error')
        return redirect(url_for('main.home'))


@admin_bp.route('/users')
@login_required
@admin_required
def users():
    """User management page."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 25, type=int)
        
        # Validate per_page to prevent abuse
        if per_page not in [25, 50, 100]:
            per_page = 25
        
        # Search functionality
        search = request.args.get('search', '')
        
        # Filter by status
        status_filter = request.args.get('status', 'all')
        
        # Get users with pagination and filtering
        users_list, total_count = User.get_all_users(page, per_page, search, status_filter)
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        has_prev = page > 1
        has_next = page < total_pages
        prev_num = page - 1 if has_prev else None
        next_num = page + 1 if has_next else None
        
        # Create pagination object for template compatibility
        pagination = type('Pagination', (), {
            'items': users_list,
            'page': page,
            'per_page': per_page,
            'total': total_count,
            'pages': total_pages,
            'has_prev': has_prev,
            'has_next': has_next,
            'prev_num': prev_num,
            'next_num': next_num
        })()
        
        return render_template('admin/users/users.html', 
                             users=users_list,
                             pagination=pagination,
                             search=search,
                             status_filter=status_filter)
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin users error: {e}")
        flash('Error loading users data.', 'error')
        return redirect(url_for('admin.dashboard'))


@admin_bp.route('/user/<int:user_id>')
@login_required
@admin_required
def user_details(user_id):
    """View detailed information about a specific user."""
    try:
        user = User.find_by_id(user_id)
        if not user:
            flash('User not found.', 'error')
            return redirect(url_for('admin.users'))
        
        # Get user's login attempts (simplified - get recent attempts)
        all_attempts = LoginAttempt.get_recent_attempts(50)  # Get more to filter
        user_attempts = [attempt for attempt in all_attempts 
                        if attempt.username_or_email in [user.username, user.email]][:20]
        
        # Get email verifications for this user
        verifications = EmailVerification.get_by_user_id(user.id)
        
        # Get contact submissions by this user's email
        contact_submissions = Contact.get_by_email(user.email, limit=10)
        
        return render_template('admin/user-details/user-details.html', 
                             user=user,
                             login_attempts=user_attempts,
                             verifications=verifications,
                             contact_submissions=contact_submissions)
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin user details error: {e}")
        flash('Error loading user details.', 'error')
        return redirect(url_for('admin.users'))


@admin_bp.route('/user/<int:user_id>/toggle-status', methods=['POST'])
@login_required
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status."""
    try:
        user = User.find_by_id(user_id)
        if not user:
            flash('User not found.', 'error')
            return redirect(url_for('admin.users'))
        
        # Prevent admin from deactivating themselves
        if user.id == current_user.id:
            flash('You cannot deactivate your own account.', 'error')
            return redirect(url_for('admin.user_details', user_id=user_id))
        
        user.is_active = not user.is_active
        user.save()
        
        status = 'activated' if user.is_active else 'deactivated'
        flash(f'User {user.username} has been {status}.', 'success')
        
        return redirect(url_for('admin.user_details', user_id=user_id))
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin toggle user status error: {e}")
        flash('Error updating user status.', 'error')
        return redirect(url_for('admin.users'))


@admin_bp.route('/user/<int:user_id>/toggle-admin', methods=['POST'])
@login_required
@admin_required
def toggle_admin_status(user_id):
    """Toggle user admin status."""
    try:
        user = User.find_by_id(user_id)
        if not user:
            flash('User not found.', 'error')
            return redirect(url_for('admin.users'))
        
        # Prevent admin from removing their own admin status
        if user.id == current_user.id:
            flash('You cannot remove your own admin privileges.', 'error')
            return redirect(url_for('admin.user_details', user_id=user_id))
        
        user.is_admin = not user.is_admin
        user.save()
        
        status = 'granted' if user.is_admin else 'revoked'
        flash(f'Admin privileges have been {status} for {user.username}.', 'success')
        
        return redirect(url_for('admin.user_details', user_id=user_id))
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin toggle admin status error: {e}")
        flash('Error updating admin status.', 'error')
        return redirect(url_for('admin.users'))


@admin_bp.route('/api/stats')
@login_required
@admin_required
def api_stats():
    """API endpoint for dashboard statistics."""
    try:
        # For now, return simplified stats since we don't have complex time-series queries
        # This could be enhanced with more sophisticated Supabase queries
        stats_data = {
            'daily_login_attempts': [],  # Would need time-series implementation
            'user_registration_trend': [],  # Would need time-series implementation
            'total_users': User.count_all(),
            'active_users': User.count_active(),
            'recent_login_attempts': LoginAttempt.count_recent_attempts(24),
            'failed_login_attempts': LoginAttempt.count_failed_attempts(24)
        }
        
        return jsonify(stats_data)
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin API stats error: {e}")
        return jsonify({'error': 'Failed to load statistics'}), 500


@admin_bp.route('/contacts')
@login_required
@admin_required
def contacts():
    """Contact submissions management page."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 25, type=int)
        
        # Validate per_page to prevent abuse
        if per_page not in [25, 50, 100]:
            per_page = 25
        
        # Search functionality
        search = request.args.get('search', '')
        
        # Filter by status
        status_filter = request.args.get('status', 'all')
        
        # Get contact submissions with pagination and filtering
        contacts_list, total_count = Contact.get_all_submissions(page, per_page, search, status_filter)
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        has_prev = page > 1
        has_next = page < total_pages
        prev_num = page - 1 if has_prev else None
        next_num = page + 1 if has_next else None
        
        # Create pagination object for template compatibility
        pagination = type('Pagination', (), {
            'items': contacts_list,
            'page': page,
            'per_page': per_page,
            'total': total_count,
            'pages': total_pages,
            'has_prev': has_prev,
            'has_next': has_next,
            'prev_num': prev_num,
            'next_num': next_num
        })()
        
        return render_template('admin/contacts/contacts.html', 
                             contacts=contacts_list,
                             pagination=pagination,
                             search=search,
                             status_filter=status_filter)
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin contacts error: {e}")
        flash('Error loading contacts data.', 'error')
        return redirect(url_for('admin.dashboard'))


@admin_bp.route('/contact/<int:contact_id>/mark-read', methods=['POST'])
@login_required
@admin_required
def mark_contact_read(contact_id):
    """Mark a contact submission as read."""
    try:
        # First get all contacts to find the one with the matching ID
        all_contacts, _ = Contact.get_all_submissions(page=1, per_page=1000)  # Get a large number
        contact = None
        for c in all_contacts:
            if c.id == contact_id:
                contact = c
                break
        
        if not contact:
            flash('Contact submission not found.', 'error')
            return redirect(url_for('admin.contacts'))
        
        contact.mark_as_read()
        flash('Contact submission marked as read.', 'success')
        
        return redirect(url_for('admin.contacts'))
    
    except DatabaseError as e:
        current_app.logger.error(f"Admin mark contact read error: {e}")
        flash('Error updating contact status.', 'error')
        return redirect(url_for('admin.contacts'))

