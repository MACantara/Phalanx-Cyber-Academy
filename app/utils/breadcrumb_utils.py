"""
Breadcrumb utility functions for admin navigation
"""

from flask import request, url_for


def get_breadcrumb_data():
    """
    Generate breadcrumb data based on current route
    Returns a list of dictionaries with 'title', 'url', and 'icon' keys
    """
    breadcrumbs = []
    
    # Base breadcrumb - Home
    breadcrumbs.append({
        'title': '[Web Site Name]',
        'url': url_for('main.home'),
        'icon': 'bi-house-door',
        'active': False
    })
    
    # Admin root
    endpoint = request.endpoint
    if not endpoint:
        return breadcrumbs
    
    # Add admin breadcrumb if not on admin dashboard
    if endpoint != 'admin.dashboard':
        breadcrumbs.append({
            'title': 'Admin',
            'url': url_for('admin.dashboard'),
            'icon': 'bi-shield-check',
            'active': False
        })
    
    # Module-specific breadcrumbs
    if endpoint.startswith('admin.'):
        breadcrumbs.extend(_get_admin_breadcrumbs(endpoint))
    elif endpoint.startswith('system_test.'):
        breadcrumbs.extend(_get_system_test_breadcrumbs(endpoint))
    elif endpoint.startswith('data_analytics.'):
        breadcrumbs.extend(_get_data_analytics_breadcrumbs(endpoint))
    elif endpoint.startswith('admin_logs.'):
        breadcrumbs.extend(_get_admin_logs_breadcrumbs(endpoint))
    elif endpoint.startswith('system_backup.'):
        breadcrumbs.extend(_get_system_backup_breadcrumbs(endpoint))
    
    # Mark the last item as active
    if breadcrumbs:
        breadcrumbs[-1]['active'] = True
        breadcrumbs[-1]['url'] = None  # Remove URL for active item
    
    return breadcrumbs


def _get_admin_breadcrumbs(endpoint):
    """Get breadcrumbs for admin module routes"""
    breadcrumbs = []
    
    if endpoint == 'admin.dashboard':
        breadcrumbs.append({
            'title': 'Admin Dashboard',
            'url': None,
            'icon': 'bi-speedometer2',
            'active': True
        })
    elif endpoint == 'admin.users':
        breadcrumbs.append({
            'title': 'User Management',
            'url': None,
            'icon': 'bi-people',
            'active': True
        })
    elif endpoint == 'admin.user_details':
        breadcrumbs.extend([
            {
                'title': 'User Management',
                'url': url_for('admin.users'),
                'icon': 'bi-people',
                'active': False
            },
            {
                'title': 'User Details',
                'url': None,
                'icon': 'bi-person',
                'active': True
            }
        ])
    elif endpoint == 'admin.contacts':
        breadcrumbs.append({
            'title': 'Contact Messages',
            'url': None,
            'icon': 'bi-envelope',
            'active': True
        })
    
    return breadcrumbs


def _get_system_test_breadcrumbs(endpoint):
    """Get breadcrumbs for system test module routes"""
    breadcrumbs = []
    
    if endpoint == 'system_test.dashboard':
        breadcrumbs.append({
            'title': 'System Testing',
            'url': None,
            'icon': 'bi-clipboard-check',
            'active': True
        })
    elif endpoint == 'system_test.test_plans_list':
        breadcrumbs.extend([
            {
                'title': 'System Testing',
                'url': url_for('system_test.dashboard'),
                'icon': 'bi-clipboard-check',
                'active': False
            },
            {
                'title': 'Test Plans',
                'url': None,
                'icon': 'bi-list-check',
                'active': True
            }
        ])
    elif endpoint == 'system_test.create_test_plan':
        breadcrumbs.extend([
            {
                'title': 'System Testing',
                'url': url_for('system_test.dashboard'),
                'icon': 'bi-clipboard-check',
                'active': False
            },
            {
                'title': 'Test Plans',
                'url': url_for('system_test.test_plans_list'),
                'icon': 'bi-list-check',
                'active': False
            },
            {
                'title': 'Create Test Plan',
                'url': None,
                'icon': 'bi-plus-circle',
                'active': True
            }
        ])
    elif endpoint in ['system_test.view_test_plan', 'system_test.edit_test_plan', 'system_test.execute_test_plan']:
        action_map = {
            'system_test.view_test_plan': ('View Test Plan', 'bi-eye'),
            'system_test.edit_test_plan': ('Edit Test Plan', 'bi-pencil'),
            'system_test.execute_test_plan': ('Execute Test', 'bi-play-circle')
        }
        
        action_title, action_icon = action_map[endpoint]
        
        breadcrumbs.extend([
            {
                'title': 'System Testing',
                'url': url_for('system_test.dashboard'),
                'icon': 'bi-clipboard-check',
                'active': False
            },
            {
                'title': 'Test Plans',
                'url': url_for('system_test.test_plans_list'),
                'icon': 'bi-list-check',
                'active': False
            },
            {
                'title': action_title,
                'url': None,
                'icon': action_icon,
                'active': True
            }
        ])
    elif endpoint == 'system_test.module_tests':
        breadcrumbs.extend([
            {
                'title': 'System Testing',
                'url': url_for('system_test.dashboard'),
                'icon': 'bi-clipboard-check',
                'active': False
            },
            {
                'title': 'Module Tests',
                'url': None,
                'icon': 'bi-grid',
                'active': True
            }
        ])
    elif endpoint == 'system_test.bulk_import':
        breadcrumbs.extend([
            {
                'title': 'System Testing',
                'url': url_for('system_test.dashboard'),
                'icon': 'bi-clipboard-check',
                'active': False
            },
            {
                'title': 'Bulk Import',
                'url': None,
                'icon': 'bi-upload',
                'active': True
            }
        ])
    elif endpoint == 'system_test.reports':
        breadcrumbs.extend([
            {
                'title': 'System Testing',
                'url': url_for('system_test.dashboard'),
                'icon': 'bi-clipboard-check',
                'active': False
            },
            {
                'title': 'Test Reports',
                'url': None,
                'icon': 'bi-graph-up',
                'active': True
            }
        ])
    
    return breadcrumbs


def _get_data_analytics_breadcrumbs(endpoint):
    """Get breadcrumbs for data analytics module routes"""
    breadcrumbs = []
    
    if endpoint == 'data_analytics.player_analytics':
        breadcrumbs.append({
            'title': 'Player Analytics',
            'url': None,
            'icon': 'bi-bar-chart',
            'active': True
        })
    elif endpoint in ['data_analytics.levels_analytics', 'data_analytics.player_analytics_levels']:
        breadcrumbs.extend([
            {
                'title': 'Player Analytics',
                'url': url_for('data_analytics.player_analytics'),
                'icon': 'bi-bar-chart',
                'active': False
            },
            {
                'title': 'Levels Analytics',
                'url': None,
                'icon': 'bi-trophy',
                'active': True
            }
        ])
    elif endpoint in ['data_analytics.blue_vs_red_analytics', 'data_analytics.player_analytics_blue_vs_red']:
        breadcrumbs.extend([
            {
                'title': 'Player Analytics',
                'url': url_for('data_analytics.player_analytics'),
                'icon': 'bi-bar-chart',
                'active': False
            },
            {
                'title': 'Blue vs Red Analytics',
                'url': None,
                'icon': 'bi-shield-shaded',
                'active': True
            }
        ])
    
    return breadcrumbs


def _get_admin_logs_breadcrumbs(endpoint):
    """Get breadcrumbs for admin logs module routes"""
    breadcrumbs = []
    
    if endpoint == 'admin_logs.logs_management':
        breadcrumbs.append({
            'title': 'System Logs',
            'url': None,
            'icon': 'bi-file-text',
            'active': True
        })
    elif endpoint == 'admin_logs.export':
        breadcrumbs.extend([
            {
                'title': 'System Logs',
                'url': url_for('admin_logs.logs_management'),
                'icon': 'bi-file-text',
                'active': False
            },
            {
                'title': 'Export Logs',
                'url': None,
                'icon': 'bi-download',
                'active': True
            }
        ])
    
    return breadcrumbs


def _get_system_backup_breadcrumbs(endpoint):
    """Get breadcrumbs for system backup module routes"""
    breadcrumbs = []
    
    if endpoint == 'system_backup.backup_management':
        breadcrumbs.append({
            'title': 'System Backup',
            'url': None,
            'icon': 'bi-cloud-download',
            'active': True
        })
    elif endpoint == 'system_backup.backup_schedule':
        breadcrumbs.extend([
            {
                'title': 'System Backup',
                'url': url_for('system_backup.backup_management'),
                'icon': 'bi-cloud-download',
                'active': False
            },
            {
                'title': 'Backup Schedule',
                'url': None,
                'icon': 'bi-calendar3',
                'active': True
            }
        ])
    
    return breadcrumbs


def inject_breadcrumb_context():
    """
    Template context processor to inject breadcrumb data
    """
    return {
        'breadcrumb_data': get_breadcrumb_data()
    }
