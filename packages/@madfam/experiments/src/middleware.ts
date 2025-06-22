/**
 * @madfam/experiments
 *
 * Middleware for various frameworks
 */

import type { Experiments } from './core/experiments';
import type { UserContext } from './core/types';

interface Request {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  userId?: string;
  [key: string]: any;
}

interface Response {
  setHeader?: (name: string, value: string) => void;
  cookie?: (name: string, value: string, options?: any) => void;
  [key: string]: any;
}

type NextFunction = () => void | Promise<void>;

interface MiddlewareConfig {
  experiments: Experiments;
  getUserContext?: (req: Request) => UserContext | Promise<UserContext>;
  cookieName?: string;
  headerName?: string;
}

/**
 * Express/Connect middleware
 */
export function experimentsMiddleware(config: MiddlewareConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user context
      const userContext = config.getUserContext
        ? await config.getUserContext(req)
        : {
            userId: req.userId || generateUserId(req),
            attributes: extractAttributes(req),
          };

      // Attach to request
      (req as any).experiments = config.experiments;
      (req as any).userContext = userContext;

      // Set user ID cookie if needed
      if (config.cookieName && res.cookie) {
        res.cookie(config.cookieName, userContext.userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });
      }

      next();
    } catch (error) {
      next();
    }
  };
}

/**
 * Next.js middleware
 */
export function withExperiments(config: MiddlewareConfig) {
  return async (req: any, res: any) => {
    const userContext = config.getUserContext
      ? await config.getUserContext(req)
      : {
          userId: req.cookies?.userId || generateUserId(req),
          attributes: extractAttributes(req),
        };

    // Extend request
    req.experiments = config.experiments;
    req.userContext = userContext;

    return { props: { userContext } };
  };
}

/**
 * Koa middleware
 */
export function koaExperiments(config: MiddlewareConfig) {
  return async (ctx: any, next: NextFunction) => {
    try {
      const userContext = config.getUserContext
        ? await config.getUserContext(ctx.request)
        : {
            userId: ctx.cookies.get('userId') || generateUserId(ctx.request),
            attributes: extractAttributes(ctx.request),
          };

      ctx.experiments = config.experiments;
      ctx.userContext = userContext;

      // Set cookie
      if (config.cookieName) {
        ctx.cookies.set(config.cookieName, userContext.userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
      }

      await next();
    } catch (error) {
      await next();
    }
  };
}

/**
 * Fastify plugin
 */
export async function fastifyExperiments(
  fastify: any,
  options: MiddlewareConfig
) {
  fastify.decorateRequest('experiments', null);
  fastify.decorateRequest('userContext', null);

  fastify.addHook('onRequest', async (request: any, reply: any) => {
    try {
      const userContext = options.getUserContext
        ? await options.getUserContext(request)
        : {
            userId: request.cookies?.userId || generateUserId(request),
            attributes: extractAttributes(request),
          };

      request.experiments = options.experiments;
      request.userContext = userContext;

      // Set cookie
      if (options.cookieName) {
        reply.setCookie(options.cookieName, userContext.userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
      }
    } catch (error) {
      // Continue without experiments
    }
  });
}

/**
 * Helper to generate user ID
 */
function generateUserId(req: Request): string {
  // Try to get from various sources
  const sources = [
    req.headers?.['x-user-id'],
    req.cookies?.userId,
    req.query?.userId,
    req.body?.userId,
  ];

  for (const source of sources) {
    if (source && typeof source === 'string') {
      return source;
    }
  }

  // Generate new ID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper to extract attributes from request
 */
function extractAttributes(req: Request): Record<string, any> {
  return {
    userAgent: req.headers?.['user-agent'],
    ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
    referer: req.headers?.referer,
    country: req.headers?.['cf-ipcountry'] || req.headers?.['x-country'],
    ...req.query,
  };
}