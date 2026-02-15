import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error504_GatewayTimeout = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error504_GatewayTimeout",log.brack);

  // Only handle gateway timeout errors
  if (err && err.status === 504) {
    const error = new BaseCustomError("Gateway Timeout", {
      title: "Gateway Timeout",
      status: 504,
      errors: {
        message: err.message || "Gateway Timeout",
        details: err.details || "The server did not receive a timely response from an upstream server",
        upstream: process.env.NODE_ENV === 'production'
          ? undefined
          : err.upstream, // Only include upstream details in development
        timeout: err.timeout || "Request exceeded time limit",
        timestamp: new Date().toISOString()
      }
    });

    // Set a retry-after header if specified
    if (err.retryAfter) {
      res.set('Retry-After', err.retryAfter.toString());
    }

    next(error);
  } else {
    // Pass to next error handler if this isn't a 504 error
    next(err);
  }
  log.retrn("error504_GatewayTimeout", log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
