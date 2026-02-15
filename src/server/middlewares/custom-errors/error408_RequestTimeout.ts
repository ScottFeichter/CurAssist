import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error408_RequestTimeout = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error408_RequestTimeout", log.brack);
  // Only handle timeout errors
  if (err && err.status === 408) {
    const error = new BaseCustomError("Request Timeout", {
      title: "Request Timeout",
      status: 408,
      errors: {
        message: err.message || "Request Timeout",
        details: "The server timed out waiting for the request to complete"
      }
    });
    next(error);
  } else {
    // Pass to next error handler if this isn't a 408 error
    next(err);
  }
  log.retrn("error408_RequestTimeout", log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
