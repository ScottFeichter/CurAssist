import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error503_ServiceUnavailable = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error503_ServiceUnavailable", log.brack);

  // Only handle service unavailable errors
  if (err && err.status === 503) {
    const error = new BaseCustomError("Service Unavailable", {
      title: "Service Unavailable",
      status: 503,
      errors: {
        message: err.message || "Service Unavailable",
        details: err.details || "The server is temporarily unable to handle the request",
        retryAfter: err.retryAfter || 60, // Suggested retry time in seconds
        maintenance: err.maintenance || false, // Flag if this is due to maintenance
        timestamp: new Date().toISOString()
      }
    });

    // Set Retry-After header if provided
    if (err.retryAfter) {
      res.set('Retry-After', err.retryAfter.toString());
    }

    next(error);
  } else {
    // Pass to next error handler if this isn't a 503 error
    next(err);
  }
  log.retrn("error503_ServiceUnabailable", log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
