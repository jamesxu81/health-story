/**
 * Authentication Middleware
 * Extracts user context from request headers/cookies
 */

import { AuthContext } from '@/types/api';
import { AuthenticationError } from '@/lib/errors';

/**
 * Mock authentication extractor
 * In production, this would validate JWT tokens or session cookies
 */
export function extractUserContext(
  headers: Record<string, string | string[] | undefined>
): AuthContext {
  // For MVP, extract user_id from custom header
  // In production: validate JWT token, check session, etc.
  const authHeader = headers['authorization'] || '';

  if (!authHeader || typeof authHeader !== 'string') {
    throw new AuthenticationError('Missing authorization header');
  }

  // Parse "Bearer {user_id}" or "Bearer jwt_token"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AuthenticationError('Invalid authorization format');
  }

  const user_id = parts[1];
  if (!user_id) {
    throw new AuthenticationError('Missing user context');
  }

  return {
    user_id,
    authenticated: true,
  };
}

/**
 * Auth middleware factory for Next.js API routes
 */
export function withAuth(
  handler: (
    req: any,
    context: { user_id: string }
  ) => Promise<Response>
) {
  return async (req: any) => {
    try {
      const headers: Record<string, string | string[] | undefined> = {};
      req.headers?.forEach((value: string | string[], key: string) => {
        headers[key.toLowerCase()] = value;
      });

      const authContext = extractUserContext(headers);
      return handler(req, { user_id: authContext.user_id });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return Response.json(
          {
            error: error.message,
            code: error.code,
            status: error.status,
            timestamp: new Date().toISOString(),
          },
          { status: error.status }
        );
      }
      throw error;
    }
  };
}
