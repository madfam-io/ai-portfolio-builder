/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/experiments
 *
 * Middleware for various frameworks
 */

import type { Experiments } from './core/experiments';
import type { UserContext } from './core/types';
import type {
  RequestContext,
  ResponseContext,
  JsonValue,
} from './core/value-types';

interface Request extends RequestContext {
  userId?: string;
  [key: string]: JsonValue;
}

interface Response extends ResponseContext {
  setHeader?: (name: string, value: string) => void;
  cookie?: (
    name: string,
    value: string,
    options?: Record<string, JsonValue>
  ) => void;
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
      (
        req as Request & { experiments: Experiments; userContext: UserContext }
      ).experiments = config.experiments;
      (
        req as Request & { experiments: Experiments; userContext: UserContext }
      ).userContext = userContext;

      // Set user ID cookie if needed
      if (config.cookieName && res.cookie) {
        res.cookie(config.cookieName, userContext.userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        } as Record<string, JsonValue>);
      }

      next();
    } catch {
      next();
    }
  };
}

/**
 * Next.js middleware
 */
export function withExperiments(config: MiddlewareConfig) {
  return async (
    req: Request & {
      cookies?: Record<string, string>;
      experiments?: Experiments;
      userContext?: UserContext;
    },
    _res: Response
  ) => {
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
  return async (
    ctx: {
      request: Request;
      experiments?: Experiments;
      userContext?: UserContext;
      cookies: {
        get: (name: string) => string | undefined;
        set: (
          name: string,
          value: string,
          options?: Record<string, unknown>
        ) => void;
      };
    },
    next: NextFunction
  ) => {
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
    } catch {
      await next();
    }
  };
}

/**
 * Fastify plugin
 */
export function fastifyExperiments(
  fastify: {
    decorateRequest: (name: string, value: unknown) => void;
    addHook: (
      hook: string,
      handler: (
        request: Request & {
          experiments?: Experiments;
          userContext?: UserContext;
          cookies?: Record<string, string>;
        },
        reply: {
          setCookie: (
            name: string,
            value: string,
            options?: Record<string, unknown>
          ) => void;
        }
      ) => Promise<void>
    ) => void;
  },
  options: MiddlewareConfig
) {
  fastify.decorateRequest('experiments', null);
  fastify.decorateRequest('userContext', null);

  fastify.addHook(
    'onRequest',
    async (
      request: Request & {
        experiments?: Experiments;
        userContext?: UserContext;
        cookies?: Record<string, string>;
      },
      reply: {
        setCookie: (
          name: string,
          value: string,
          options?: Record<string, unknown>
        ) => void;
      }
    ) => {
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
      } catch {
        // Continue without experiments
      }
    }
  );
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
    typeof req.body === 'object' && req.body !== null && 'userId' in req.body
      ? req.body.userId
      : undefined,
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
function extractAttributes(
  req: Request
): import('./core/types').UserAttributes {
  return {
    userAgent: req.headers?.['user-agent'],
    ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
    referer: req.headers?.referer,
    country: req.headers?.['cf-ipcountry'] || req.headers?.['x-country'],
    ...req.query,
  };
}
