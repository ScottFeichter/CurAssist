import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error502_BadGateway = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error502_BadGateway", log.brack);
  // Only handle bad gateway errors
  if (err && err.status === 502) {
    const error = new BaseCustomError("Bad Gateway", {
      title: "Bad Gateway",
      status: 502,
      errors: {
        message: err.message || "Bad Gateway",
        details: err.details || "The server received an invalid response from an upstream server",
        upstream: process.env.NODE_ENV === 'production'
          ? undefined
          : err.upstream, // Only include upstream details in development
        timestamp: new Date().toISOString()
      }
    });
    next(error);
  } else {
    // Pass to next error handler if this isn't a 502 error
    next(err);
  }
  log.retrn("error502_BadGateway", log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
