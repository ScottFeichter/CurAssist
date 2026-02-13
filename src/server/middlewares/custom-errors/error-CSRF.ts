import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';
import { CSRFError } from '@/types/ts-definitions';

console.enter();

// #region ========================== START ====================================

export const handleCSRFError = (
  err: CSRFError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter('handleCSRFError', log.brack);

  if (err.code === 'EBADCSRFTOKEN') {
    const csrfError = new BaseCustomError(
      'CSRF token validation failed',
      {
        title: 'Security Error',
        status: 403,
        errors: {
          csrf: 'Invalid or missing CSRF token',
          details: process.env.NODE_ENV === 'development'
            ? 'Ensure credentials: "include" is set in fetch options'
            : 'Access denied'
        },
        cause: {
          code: 'EBADCSRFTOKEN',
          csrfCookie: req.cookies._csrf,
          providedToken: req.headers['x-csrf-token'] || req.headers['xsrf-token'],
          headers: {
            xsrfToken: req.headers['xsrf-token'],
            csrfToken: req.headers['x-csrf-token']
          }
        }
      }
    );

    Error.captureStackTrace(csrfError, handleCSRFError);

    const parsedStack = err.stack?.split('\n')
      .map(line => line.trim())
      .filter(line =>
        line.startsWith('at ') &&
        !line.includes('node_modules')
      )
      .map(line => {
        const [, functionName = 'anonymous', location = ''] =
          line.match(/at (?:(.+?)\s+\()?(.+?)(?:\))?$/) || [];

        return {
          function: functionName,
          location: location.replace(process.cwd(), '').replace(/^\//, '')
        };
      });

    csrfError.trace = parsedStack;

    Object.assign(err, csrfError);
    next(err);
  } else {
    next(err);
  }

  log.retrn('handleCSRFError', log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
