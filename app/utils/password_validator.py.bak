"""
Password validation utility using zxcvbn for strength checking
"""
from zxcvbn import zxcvbn
import re
from typing import Tuple, List, Dict, Any

class PasswordValidator:
    """Password validator with zxcvbn strength checking and basic requirements."""
    
    # Minimum password requirements
    MIN_LENGTH = 8
    MIN_SCORE = 2  # zxcvbn score (0-4), 2 = fair strength
    
    @classmethod
    def validate_password(cls, password: str, user_inputs: List[str] = None) -> Tuple[bool, List[str], Dict[str, Any]]:
        """
        Validate password strength and requirements.
        
        Args:
            password: The password to validate
            user_inputs: List of user-specific inputs (username, email, name, etc.)
            
        Returns:
            Tuple of (is_valid, error_messages, zxcvbn_result)
        """
        if not password:
            return False, ["Password is required."], {}
        
        errors = []
        user_inputs = user_inputs or []
        
        # Basic length check
        if len(password) < cls.MIN_LENGTH:
            errors.append(f"Password must be at least {cls.MIN_LENGTH} characters long.")
        
        # Check for basic character requirements
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter.")
        
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter.")
        
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one digit.")
        
        # Add special character requirement
        if not re.search(r'[^A-Za-z0-9]', password):
            errors.append("Password must contain at least one special character.")

        # Use zxcvbn for advanced strength checking
        try:
            result = zxcvbn(password, user_inputs=user_inputs)
            
            # Check minimum score requirement
            if result['score'] < cls.MIN_SCORE:
                score_messages = {
                    0: "Password is too weak (very easy to crack).",
                    1: "Password is weak (easy to crack).",
                }
                errors.append(score_messages.get(result['score'], "Password is too weak."))
                
                # Add specific feedback from zxcvbn
                if result.get('feedback', {}).get('warning'):
                    errors.append(f"Warning: {result['feedback']['warning']}")
                
                # Add suggestions from zxcvbn
                suggestions = result.get('feedback', {}).get('suggestions', [])
                for suggestion in suggestions[:2]:  # Limit to 2 suggestions
                    errors.append(f"Suggestion: {suggestion}")
            
            is_valid = len(errors) == 0
            return is_valid, errors, result
            
        except Exception as e:
            # Fallback to basic validation if zxcvbn fails
            errors.append("Unable to check password strength. Please ensure it meets basic requirements.")
            is_valid = len(errors) == 1  # Only the zxcvbn error
            return is_valid, errors, {}
    
    @classmethod
    def get_strength_info(cls, password: str, user_inputs: List[str] = None) -> Dict[str, Any]:
        """
        Get detailed password strength information for client-side display.
        
        Returns:
            Dictionary with strength score, feedback, and crack time estimates
        """
        if not password:
            return {
                'score': 0,
                'strength': 'empty',
                'crack_time': 'instantly',
                'feedback': {'warning': 'Password is required', 'suggestions': []}
            }
        
        try:
            result = zxcvbn(password, user_inputs=user_inputs or [])
            
            strength_labels = {
                0: 'very weak',
                1: 'weak', 
                2: 'fair',
                3: 'good',
                4: 'very strong'
            }
            
            # Convert calc_time to float if it's a timedelta
            calc_time = result.get('calc_time', 0)
            if hasattr(calc_time, 'total_seconds'):
                calc_time = calc_time.total_seconds()
            
            return {
                'score': result['score'],
                'strength': strength_labels[result['score']],
                'crack_time': result['crack_times_display']['offline_slow_hashing_1e4_per_second'],
                'feedback': result.get('feedback', {'warning': '', 'suggestions': []}),
                'guesses': result.get('guesses', 0),
                'calc_time': calc_time
            }
            
        except Exception:
            return {
                'score': 1,
                'strength': 'unknown',
                'crack_time': 'unknown',
                'feedback': {'warning': 'Unable to analyze password strength', 'suggestions': []}
            }

def validate_password(password: str, user_inputs: List[str] = None) -> Tuple[bool, str]:
    """
    Simple password validation function for backward compatibility.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    is_valid, errors, _ = PasswordValidator.validate_password(password, user_inputs)
    error_message = errors[0] if errors else "Password is valid"
    return is_valid, error_message
