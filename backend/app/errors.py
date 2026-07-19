import logging

logger = logging.getLogger(__name__)


class DatabaseError(Exception):
    """Custom exception for database operations."""
    pass


def handle_supabase_error(response):
    """Handle Supabase response and raise appropriate errors."""
    if hasattr(response, "data") and response.data is not None:
        return response.data
    elif hasattr(response, "error") and response.error:
        error_msg = (
            response.error.message
            if hasattr(response.error, "message")
            else str(response.error)
        )
        logger.error(f"Supabase error: {error_msg}")
        raise DatabaseError(f"Database operation failed: {error_msg}")
    else:
        logger.error("Unknown Supabase response format")
        raise DatabaseError("Unknown database error occurred")
