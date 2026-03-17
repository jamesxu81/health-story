/**
 * API response and error types
 */

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Standard API success response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: 'success';
  timestamp: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
  };
  status: 'success';
  timestamp: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: {
    connected: boolean;
    latency_ms: number;
  };
  timestamp: string;
}

/**
 * Authentication context from middleware
 */
export interface AuthContext {
  user_id: string;
  authenticated: boolean;
}
