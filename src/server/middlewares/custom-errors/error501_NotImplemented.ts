import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { BaseCustomError } from './base-custom-error';
import { Request, Response, NextFunction } from 'express';

console.enter();

// #region ====================== START ========================================

export const error501_NotImplemented = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error501_NotImplemented", log.brack);
  // Only handle not implemented errors
  if (err && err.status === 501) {
    const error = new BaseCustomError("This functionality is not implemented.", {
      title: "Not Implemented",
      status: 501,
      errors: {
        message: err.message || "This functionality is not implemented.",
        details: err.details || "The requested functionality is not currently supported by the server.",
        method: err.method || req.method, // Optionally include the HTTP method that's not implemented
        path: err.path || req.path // Optionally include the path that's not implemented
      }
    });
    next(error);
  } else {
    // Pass to next error handler if this isn't a 501 error
    next(err);
  }
  log.retrn("error501_NotImplemented", log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
