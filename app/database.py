"""
Supabase database configuration and client initialization.
"""
import os
from supabase import create_client, Client
from typing import Optional
import logging

# Initialize logger
logger = logging.getLogger(__name__)

# Global Supabase client
supabase: Optional[Client] = None

def init_supabase() -> Client:
    """Initialize Supabase client with environment variables."""
    global supabase
    
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
    
    try:
        supabase = create_client(url, key)
        logger.info("Supabase client initialized successfully")
        return supabase
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise

def get_supabase() -> Client:
    """Get the initialized Supabase client."""
    global supabase
    if supabase is None:
        supabase = init_supabase()
    return supabase

# Table names as constants
class Tables:
    USERS = "users"
    CONTACT_SUBMISSIONS = "contact_submissions"
    LOGIN_ATTEMPTS = "login_attempts"
    EMAIL_VERIFICATIONS = "email_verifications"

# Common database operations
class DatabaseError(Exception):
    """Custom exception for database operations."""
    pass

def handle_supabase_error(response):
    """Handle Supabase response and raise appropriate errors."""
    if hasattr(response, 'data') and response.data is not None:
        return response.data
    elif hasattr(response, 'error') and response.error:
        error_msg = response.error.message if hasattr(response.error, 'message') else str(response.error)
        logger.error(f"Supabase error: {error_msg}")
        raise DatabaseError(f"Database operation failed: {error_msg}")
    else:
        logger.error("Unknown Supabase response format")
        raise DatabaseError("Unknown database error occurred")
