"""
System Test Plan Models
Database models for managing system test plans and test execution results
"""
from datetime import datetime
from typing import Dict, List, Any, Optional
from app.database import get_supabase
from app.utils.timezone_utils import utc_now

class SystemTestPlan:
    """Model for system test plan entries."""
    
    def __init__(self, id=None, test_plan_no=None, module_name=None, screen_design_ref=None,
                 description=None, scenario=None, expected_results=None, procedure=None,
                 test_status=None, execution_date=None, executed_by=None, failure_reason=None,
                 priority=None, category=None, created_at=None, updated_at=None):
        self.id = id
        self.test_plan_no = test_plan_no
        self.module_name = module_name
        self.screen_design_ref = screen_design_ref
        self.description = description
        self.scenario = scenario
        self.expected_results = expected_results
        self.procedure = procedure
        self.test_status = test_status  # 'pending', 'passed', 'failed', 'skipped'
        self.execution_date = execution_date
        self.executed_by = executed_by
        self.failure_reason = failure_reason
        self.priority = priority  # 'low', 'medium', 'high', 'critical'
        self.category = category  # 'functional', 'ui', 'performance', 'security', 'integration'
        self.created_at = created_at
        self.updated_at = updated_at
    
    def save(self):
        """Save or update test plan in database."""
        try:
            supabase = get_supabase()
            
            data = {
                'test_plan_no': self.test_plan_no,
                'module_name': self.module_name,
                'screen_design_ref': self.screen_design_ref,
                'description': self.description,
                'scenario': self.scenario,
                'expected_results': self.expected_results,
                'procedure': self.procedure,
                'test_status': self.test_status,
                'execution_date': self.execution_date.isoformat() if self.execution_date else None,
                'executed_by': self.executed_by,
                'failure_reason': self.failure_reason,
                'priority': self.priority,
                'category': self.category,
                'updated_at': utc_now().isoformat()
            }
            
            if self.id:
                # Update existing record
                result = supabase.table('system_test_plans').update(data).eq('id', self.id).execute()
            else:
                # Insert new record
                data['created_at'] = utc_now().isoformat()
                result = supabase.table('system_test_plans').insert(data).execute()
                if result.data:
                    self.id = result.data[0]['id']
            
            return True
        except Exception as e:
            print(f"Error saving test plan: {e}")
            return False
    
    @classmethod
    def get_by_id(cls, test_plan_id: int):
        """Get test plan by ID."""
        try:
            supabase = get_supabase()
            result = supabase.table('system_test_plans').select('*').eq('id', test_plan_id).execute()
            
            if result.data:
                data = result.data[0]
                return cls(
                    id=data['id'],
                    test_plan_no=data['test_plan_no'],
                    module_name=data['module_name'],
                    screen_design_ref=data['screen_design_ref'],
                    description=data['description'],
                    scenario=data['scenario'],
                    expected_results=data['expected_results'],
                    procedure=data['procedure'],
                    test_status=data['test_status'],
                    execution_date=datetime.fromisoformat(data['execution_date'].replace('Z', '+00:00')) if data['execution_date'] else None,
                    executed_by=data['executed_by'],
                    failure_reason=data['failure_reason'],
                    priority=data['priority'],
                    category=data['category'],
                    created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00')) if data['created_at'] else None,
                    updated_at=datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00')) if data['updated_at'] else None
                )
            return None
        except Exception as e:
            print(f"Error getting test plan: {e}")
            return None
    
    @classmethod
    def get_all(cls, filters: Dict[str, Any] = None, order_by: str = 'test_plan_no', limit: int = None):
        """Get all test plans with optional filters."""
        try:
            supabase = get_supabase()
            query = supabase.table('system_test_plans').select('*')
            
            # Apply filters
            if filters:
                if 'module_name' in filters and filters['module_name']:
                    query = query.eq('module_name', filters['module_name'])
                if 'test_status' in filters and filters['test_status']:
                    query = query.eq('test_status', filters['test_status'])
                if 'priority' in filters and filters['priority']:
                    query = query.eq('priority', filters['priority'])
                if 'category' in filters and filters['category']:
                    query = query.eq('category', filters['category'])
                if 'executed_by' in filters and filters['executed_by']:
                    query = query.eq('executed_by', filters['executed_by'])
            
            # Apply ordering - handle desc/asc properly
            if order_by:
                if ' desc' in order_by.lower():
                    column = order_by.lower().replace(' desc', '').strip()
                    query = query.order(column, desc=True)
                elif ' asc' in order_by.lower():
                    column = order_by.lower().replace(' asc', '').strip()
                    query = query.order(column, desc=False)
                else:
                    query = query.order(order_by)
            
            # Apply limit - use a high limit if not specified to get all records
            if limit is not None:
                query = query.limit(limit)
            else:
                # Set a high limit to get all records (Supabase default is 1000)
                query = query.limit(10000)  # Increase to handle your 1105+ records
            
            result = query.execute()
            
            test_plans = []
            for data in result.data:
                test_plans.append(cls(
                    id=data['id'],
                    test_plan_no=data['test_plan_no'],
                    module_name=data['module_name'],
                    screen_design_ref=data['screen_design_ref'],
                    description=data['description'],
                    scenario=data['scenario'],
                    expected_results=data['expected_results'],
                    procedure=data['procedure'],
                    test_status=data['test_status'],
                    execution_date=datetime.fromisoformat(data['execution_date'].replace('Z', '+00:00')) if data['execution_date'] else None,
                    executed_by=data['executed_by'],
                    failure_reason=data['failure_reason'],
                    priority=data['priority'],
                    category=data['category'],
                    created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00')) if data['created_at'] else None,
                    updated_at=datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00')) if data['updated_at'] else None
                ))
            
            return test_plans
        except Exception as e:
            print(f"Error getting test plans: {e}")
            return []
    
    @classmethod
    def get_all_paginated(cls, filters: Dict[str, Any] = None, order_by: str = 'test_plan_no', page_size: int = 1000):
        """Get all test plans using pagination to handle large datasets."""
        try:
            all_test_plans = []
            offset = 0
            
            while True:
                supabase = get_supabase()
                query = supabase.table('system_test_plans').select('*')
                
                # Apply filters
                if filters:
                    if 'module_name' in filters and filters['module_name']:
                        query = query.eq('module_name', filters['module_name'])
                    if 'test_status' in filters and filters['test_status']:
                        query = query.eq('test_status', filters['test_status'])
                    if 'priority' in filters and filters['priority']:
                        query = query.eq('priority', filters['priority'])
                    if 'category' in filters and filters['category']:
                        query = query.eq('category', filters['category'])
                    if 'executed_by' in filters and filters['executed_by']:
                        query = query.eq('executed_by', filters['executed_by'])
                
                # Apply ordering
                if order_by:
                    if ' desc' in order_by.lower():
                        column = order_by.lower().replace(' desc', '').strip()
                        query = query.order(column, desc=True)
                    elif ' asc' in order_by.lower():
                        column = order_by.lower().replace(' asc', '').strip()
                        query = query.order(column, desc=False)
                    else:
                        query = query.order(order_by)
                
                # Apply pagination
                query = query.range(offset, offset + page_size - 1)
                result = query.execute()
                
                if not result.data:
                    break
                
                # Convert to objects
                for data in result.data:
                    all_test_plans.append(cls(
                        id=data['id'],
                        test_plan_no=data['test_plan_no'],
                        module_name=data['module_name'],
                        screen_design_ref=data['screen_design_ref'],
                        description=data['description'],
                        scenario=data['scenario'],
                        expected_results=data['expected_results'],
                        procedure=data['procedure'],
                        test_status=data['test_status'],
                        execution_date=datetime.fromisoformat(data['execution_date'].replace('Z', '+00:00')) if data['execution_date'] else None,
                        executed_by=data['executed_by'],
                        failure_reason=data['failure_reason'],
                        priority=data['priority'],
                        category=data['category'],
                        created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00')) if data['created_at'] else None,
                        updated_at=datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00')) if data['updated_at'] else None
                    ))
                
                # If we got less than page_size records, we've reached the end
                if len(result.data) < page_size:
                    break
                
                offset += page_size
            
            return all_test_plans
        except Exception as e:
            print(f"Error getting test plans with pagination: {e}")
            return []
    
    @classmethod
    def get_by_module(cls, module_name: str):
        """Get all test plans for a specific module."""
        return cls.get_all(filters={'module_name': module_name})
    
    @classmethod
    def get_next_pending_test(cls, current_test_id: int):
        """Get the next pending test case after the current one."""
        try:
            supabase = get_supabase()
            
            # First, get the current test to know its order
            current_test_result = supabase.table('system_test_plans').select('test_plan_no').eq('id', current_test_id).execute()
            if not current_test_result.data:
                return None
            
            current_test_plan_no = current_test_result.data[0]['test_plan_no']
            
            # Find the next pending test case ordered by test_plan_no
            result = supabase.table('system_test_plans').select('*').eq('test_status', 'pending').gt('test_plan_no', current_test_plan_no).order('test_plan_no').limit(1).execute()
            
            if result.data:
                data = result.data[0]
                return cls(
                    id=data['id'],
                    test_plan_no=data['test_plan_no'],
                    module_name=data['module_name'],
                    screen_design_ref=data['screen_design_ref'],
                    description=data['description'],
                    scenario=data['scenario'],
                    expected_results=data['expected_results'],
                    procedure=data['procedure'],
                    test_status=data['test_status'],
                    execution_date=datetime.fromisoformat(data['execution_date'].replace('Z', '+00:00')) if data['execution_date'] else None,
                    executed_by=data['executed_by'],
                    failure_reason=data['failure_reason'],
                    priority=data['priority'],
                    category=data['category'],
                    created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00')) if data['created_at'] else None,
                    updated_at=datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00')) if data['updated_at'] else None
                )
            
            # If no test found after current one, try to find the first pending test from the beginning
            result = supabase.table('system_test_plans').select('*').eq('test_status', 'pending').order('test_plan_no').limit(1).execute()
            
            if result.data:
                data = result.data[0]
                # Only return if it's different from the current test
                if data['id'] != current_test_id:
                    return cls(
                        id=data['id'],
                        test_plan_no=data['test_plan_no'],
                        module_name=data['module_name'],
                        screen_design_ref=data['screen_design_ref'],
                        description=data['description'],
                        scenario=data['scenario'],
                        expected_results=data['expected_results'],
                        procedure=data['procedure'],
                        test_status=data['test_status'],
                        execution_date=datetime.fromisoformat(data['execution_date'].replace('Z', '+00:00')) if data['execution_date'] else None,
                        executed_by=data['executed_by'],
                        failure_reason=data['failure_reason'],
                        priority=data['priority'],
                        category=data['category'],
                        created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00')) if data['created_at'] else None,
                        updated_at=datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00')) if data['updated_at'] else None
                    )
            
            return None
        except Exception as e:
            print(f"Error getting next pending test: {e}")
            return None
    
    @classmethod
    def get_test_summary(cls):
        """Get test execution summary statistics."""
        try:
            # Use pagination to get ALL records for accurate counts
            all_records = cls.get_all_paginated()
            
            summary = {
                'total': len(all_records),
                'passed': 0,
                'failed': 0,
                'pending': 0,
                'skipped': 0
            }
            
            for test_plan in all_records:
                status = test_plan.test_status or 'pending'
                if status in summary:
                    summary[status] += 1
            
            pass_rate = (summary['passed'] / summary['total'] * 100) if summary['total'] > 0 else 0
            
            # Create object-like structure for template
            summary_obj = type('TestSummary', (), {
                'total_tests': summary['total'],
                'passed_tests': summary['passed'],
                'failed_tests': summary['failed'],
                'pending_tests': summary['pending'],
                'skipped_tests': summary['skipped'],
                'pass_rate': pass_rate
            })()
            
            return summary_obj
        except Exception as e:
            print(f"Error getting test summary: {e}")
            # Return empty object with all attributes set to 0
            return type('TestSummary', (), {
                'total_tests': 0,
                'passed_tests': 0,
                'failed_tests': 0,
                'pending_tests': 0,
                'skipped_tests': 0,
                'pass_rate': 0
            })()
    
    @classmethod
    def get_modules_summary(cls):
        """Get test summary by module."""
        try:
            # Use pagination to get ALL records for accurate module summary
            all_records = cls.get_all_paginated()
            
            modules = {}
            for test_plan in all_records:
                module = test_plan.module_name
                status = test_plan.test_status or 'pending'
                
                if module not in modules:
                    modules[module] = {'total': 0, 'passed': 0, 'failed': 0, 'pending': 0, 'skipped': 0}
                
                modules[module]['total'] += 1
                modules[module][status] += 1
            
            # Convert to list of objects with proper attribute names for template
            modules_list = []
            for module_name, stats in modules.items():
                total = stats['total']
                passed = stats['passed']
                pass_rate = (passed / total * 100) if total > 0 else 0
                
                # Create a simple object-like dictionary that supports dot notation in template
                module_obj = type('ModuleSummary', (), {
                    'module_name': module_name,
                    'total_tests': total,
                    'passed_tests': passed,
                    'failed_tests': stats['failed'],
                    'pending_tests': stats['pending'],
                    'skipped_tests': stats['skipped'],
                    'pass_rate': pass_rate
                })()
                
                modules_list.append(module_obj)
            
            # Sort by module name for consistent display
            modules_list.sort(key=lambda x: x.module_name)
            
            return modules_list
        except Exception as e:
            print(f"Error getting modules summary: {e}")
            return []
    
    def delete(self):
        """Delete test plan from database."""
        try:
            if not self.id:
                return False
            
            supabase = get_supabase()
            result = supabase.table('system_test_plans').delete().eq('id', self.id).execute()
            return True
        except Exception as e:
            print(f"Error deleting test plan: {e}")
            return False
    
    @classmethod
    def bulk_import(cls, test_plans_data: List[Dict[str, Any]]):
        """Bulk import test plans from list of dictionaries."""
        try:
            supabase = get_supabase()
            
            # Prepare data for insertion
            insert_data = []
            for plan_data in test_plans_data:
                insert_data.append({
                    'test_plan_no': plan_data.get('test_plan_no'),
                    'module_name': plan_data.get('module_name'),
                    'screen_design_ref': plan_data.get('screen_design_ref'),
                    'description': plan_data.get('description'),
                    'scenario': plan_data.get('scenario'),
                    'expected_results': plan_data.get('expected_results'),
                    'procedure': plan_data.get('procedure'),
                    'test_status': plan_data.get('test_status', 'pending'),
                    'priority': plan_data.get('priority', 'medium'),
                    'category': plan_data.get('category', 'functional'),
                    'created_at': utc_now().isoformat(),
                    'updated_at': utc_now().isoformat()
                })
            
            result = supabase.table('system_test_plans').insert(insert_data).execute()
            return len(result.data) if result.data else 0
        except Exception as e:
            print(f"Error bulk importing test plans: {e}")
            return 0
    
    def to_dict(self):
        """Convert test plan to dictionary."""
        return {
            'id': self.id,
            'test_plan_no': self.test_plan_no,
            'module_name': self.module_name,
            'screen_design_ref': self.screen_design_ref,
            'description': self.description,
            'scenario': self.scenario,
            'expected_results': self.expected_results,
            'procedure': self.procedure,
            'test_status': self.test_status,
            'execution_date': self.execution_date.isoformat() if self.execution_date else None,
            'executed_by': self.executed_by,
            'failure_reason': self.failure_reason,
            'priority': self.priority,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
