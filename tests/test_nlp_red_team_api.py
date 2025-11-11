"""
Testing Script for NLP-Enhanced Red Team AI
Tests the NLP API endpoints and validates responses
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = 'http://localhost:5000'
API_PREFIX = '/api/red-team-nlp'

# Test credentials (update with valid credentials)
TEST_USER = {
    'username': 'test_user',
    'password': 'test_password'
}

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_test(test_name, passed, message=''):
    """Print test result with color coding"""
    status = f"{Colors.GREEN}✓ PASS{Colors.RESET}" if passed else f"{Colors.RED}✗ FAIL{Colors.RESET}"
    print(f"{status} - {Colors.BOLD}{test_name}{Colors.RESET}")
    if message:
        print(f"  {message}")

def print_section(section_name):
    """Print section header"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}{Colors.BOLD}{section_name}{Colors.RESET}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.RESET}\n")

def login(session):
    """Login to the application"""
    try:
        response = session.post(
            f"{BASE_URL}/auth/login",
            data=TEST_USER,
            follow_redirects=True
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Login failed: {e}")
        return False

def test_analyze_context(session):
    """Test the analyze-context endpoint"""
    print_section("Testing Analyze Context Endpoint")
    
    # Test case 1: Weak defenses
    print(f"{Colors.YELLOW}Test Case 1: Weak Defenses{Colors.RESET}")
    payload = {
        'gameState': {
            'assets': {
                'academy-server': {'status': 'secure', 'integrity': 100},
                'student-db': {'status': 'secure', 'integrity': 100}
            },
            'securityControls': {
                'firewall': {'active': False, 'effectiveness': 30},
                'endpoint': {'active': True, 'effectiveness': 40},
                'access': {'active': True, 'effectiveness': 45}
            },
            'alerts': []
        },
        'currentPhase': 'initial-access',
        'completedPhases': ['reconnaissance']
    }
    
    try:
        response = session.post(
            f"{BASE_URL}{API_PREFIX}/analyze-context",
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        passed = response.status_code == 200
        print_test("Weak defenses endpoint responds", passed)
        
        if passed:
            data = response.json()
            print_test("Response contains context_analysis", 'context_analysis' in data)
            print_test("Response contains recommended_techniques", 'recommended_techniques' in data)
            print_test("Response contains success_metrics", 'success_metrics' in data)
            
            if 'recommended_techniques' in data:
                techniques = data['recommended_techniques']
                print(f"  {Colors.GREEN}Recommended {len(techniques)} techniques{Colors.RESET}")
                for i, tech in enumerate(techniques[:3], 1):
                    print(f"    {i}. {tech.get('name', 'Unknown')} (Score: {tech.get('score', 0)})")
            
            if 'context_analysis' in data:
                context = data['context_analysis']
                print(f"  Defensive Strength: {context.get('defensive_strength', 0)}")
                print(f"  Overall Posture: {context.get('overall_posture', 'unknown')}")
                print(f"  Vulnerabilities: {len(context.get('vulnerabilities', []))}")
    except Exception as e:
        print_test("Weak defenses endpoint responds", False, str(e))
    
    # Test case 2: Strong defenses
    print(f"\n{Colors.YELLOW}Test Case 2: Strong Defenses{Colors.RESET}")
    payload['gameState']['securityControls'] = {
        'firewall': {'active': True, 'effectiveness': 95},
        'endpoint': {'active': True, 'effectiveness': 90},
        'access': {'active': True, 'effectiveness': 92}
    }
    
    try:
        response = session.post(
            f"{BASE_URL}{API_PREFIX}/analyze-context",
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        passed = response.status_code == 200
        print_test("Strong defenses endpoint responds", passed)
        
        if passed:
            data = response.json()
            context = data.get('context_analysis', {})
            print(f"  Defensive Strength: {context.get('defensive_strength', 0)}")
            print(f"  Overall Posture: {context.get('overall_posture', 'unknown')}")
            
            # Verify that strong defenses are detected
            passed = context.get('overall_posture') in ['moderate', 'strong']
            print_test("Correctly identifies strong defenses", passed)
    except Exception as e:
        print_test("Strong defenses endpoint responds", False, str(e))

def test_technique_info(session):
    """Test the technique-info endpoint"""
    print_section("Testing Technique Info Endpoint")
    
    test_techniques = ['T1595', 'T1566', 'T1003', 'T1485']
    
    for tech_id in test_techniques:
        try:
            response = session.get(f"{BASE_URL}{API_PREFIX}/technique-info/{tech_id}")
            
            passed = response.status_code == 200
            print_test(f"Get info for {tech_id}", passed)
            
            if passed:
                data = response.json()
                technique = data.get('technique', {})
                print(f"  Name: {technique.get('name', 'Unknown')}")
                print(f"  Tactic: {technique.get('tactic', 'Unknown')}")
                print(f"  Severity: {technique.get('severity', 'Unknown')}")
        except Exception as e:
            print_test(f"Get info for {tech_id}", False, str(e))
    
    # Test invalid technique
    print(f"\n{Colors.YELLOW}Testing Invalid Technique{Colors.RESET}")
    try:
        response = session.get(f"{BASE_URL}{API_PREFIX}/technique-info/T9999")
        passed = response.status_code == 404
        print_test("Returns 404 for invalid technique", passed)
    except Exception as e:
        print_test("Returns 404 for invalid technique", False, str(e))

def test_training_feedback(session):
    """Test the training-feedback endpoint"""
    print_section("Testing Training Feedback Endpoint")
    
    feedback_data = {
        'predictedSuccess': 0.75,
        'actualSuccess': True,
        'techniqueUsed': 'T1566',
        'context': {
            'phase': 'initial-access',
            'defensiveStrength': 45
        },
        'reward': 1.2
    }
    
    try:
        response = session.post(
            f"{BASE_URL}{API_PREFIX}/training-feedback",
            json=feedback_data,
            headers={'Content-Type': 'application/json'}
        )
        
        passed = response.status_code == 200
        print_test("Send training feedback", passed)
        
        if passed:
            data = response.json()
            print_test("Feedback accepted", data.get('success', False))
            print(f"  Message: {data.get('message', 'No message')}")
    except Exception as e:
        print_test("Send training feedback", False, str(e))

def test_error_handling(session):
    """Test error handling"""
    print_section("Testing Error Handling")
    
    # Test missing data
    try:
        response = session.post(
            f"{BASE_URL}{API_PREFIX}/analyze-context",
            json={},
            headers={'Content-Type': 'application/json'}
        )
        passed = response.status_code == 400
        print_test("Handles missing data (400)", passed)
    except Exception as e:
        print_test("Handles missing data (400)", False, str(e))
    
    # Test invalid JSON
    try:
        response = session.post(
            f"{BASE_URL}{API_PREFIX}/analyze-context",
            data="invalid json",
            headers={'Content-Type': 'application/json'}
        )
        passed = response.status_code in [400, 500]
        print_test("Handles invalid JSON", passed)
    except Exception as e:
        print_test("Handles invalid JSON", False, str(e))

def test_performance(session):
    """Test API performance"""
    print_section("Testing Performance")
    
    payload = {
        'gameState': {
            'assets': {
                'academy-server': {'status': 'secure', 'integrity': 100}
            },
            'securityControls': {
                'firewall': {'active': True, 'effectiveness': 80}
            },
            'alerts': []
        },
        'currentPhase': 'reconnaissance',
        'completedPhases': []
    }
    
    num_requests = 10
    response_times = []
    
    print(f"Making {num_requests} requests...")
    for i in range(num_requests):
        try:
            start_time = datetime.now()
            response = session.post(
                f"{BASE_URL}{API_PREFIX}/analyze-context",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            end_time = datetime.now()
            
            if response.status_code == 200:
                response_time = (end_time - start_time).total_seconds() * 1000
                response_times.append(response_time)
        except Exception as e:
            print(f"  Request {i+1} failed: {e}")
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        min_time = min(response_times)
        max_time = max(response_times)
        
        print(f"\n  Average response time: {Colors.GREEN}{avg_time:.2f}ms{Colors.RESET}")
        print(f"  Min response time: {min_time:.2f}ms")
        print(f"  Max response time: {max_time:.2f}ms")
        
        # Performance threshold: 100ms
        passed = avg_time < 100
        print_test("Average response time < 100ms", passed)
    else:
        print_test("Performance test", False, "No successful requests")

def run_all_tests():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}NLP-Enhanced Red Team AI - API Test Suite{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    
    # Create session
    session = requests.Session()
    
    # Note: Authentication is required. In a real scenario, you would:
    # 1. Login first or use API tokens
    # 2. Handle CSRF tokens
    # For now, we'll test without authentication (some tests may fail)
    
    print(f"\n{Colors.YELLOW}Note: Some tests may fail due to authentication requirements{Colors.RESET}")
    print(f"{Colors.YELLOW}Update TEST_USER credentials to run authenticated tests{Colors.RESET}")
    
    # Run tests
    test_analyze_context(session)
    test_technique_info(session)
    test_training_feedback(session)
    test_error_handling(session)
    test_performance(session)
    
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}Test Suite Complete{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")

if __name__ == '__main__':
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}\n")
    except Exception as e:
        print(f"\n\n{Colors.RED}Test suite failed: {e}{Colors.RESET}\n")
