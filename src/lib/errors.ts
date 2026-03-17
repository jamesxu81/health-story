/**
 * API Error Handler
 * Standardized error formatting and HTTP status codes
 */

export class ApiErrorClass extends Error {
  constructor(
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public status: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation error - 400 Bad Request
 */
export class ValidationError extends ApiErrorClass {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Authentication error - 401 Unauthorized
 */
export class AuthenticationError extends ApiErrorClass {
  constructor(message: string = 'Unauthorized') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Authorization error - 403 Forbidden
 */
export class AuthorizationError extends ApiErrorClass {
  constructor(message: string = 'Forbidden') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

/**
 * Not found error - 404 Not Found
 */
export class NotFoundError extends ApiErrorClass {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

/**
 * Conflict error - 409 Conflict
 */
export class ConflictError extends ApiErrorClass {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

/**
 * Database error - 500 Internal Server Error
 */
export class DatabaseError extends ApiErrorClass {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500);
  }
}

/**
 * Format error for API response
 */
export function formatError(error: unknown) {
  if (error instanceof ApiErrorClass) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'INTERNAL_ERROR',
      status: 500,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: 'Unknown error',
    code: 'INTERNAL_ERROR',
    status: 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert Error to HTTP response
 */
export function errorToResponse(error: unknown): {
  body: Record<string, unknown>;
  status: number;
} {
  const formatted = formatError(error);
  return {
    body: formatted,
    status: formatted.status,
  };
}
