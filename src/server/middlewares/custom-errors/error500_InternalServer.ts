import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error500_InternalServer = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error500_InternalServer", log.brack);

  // Handle both explicit 500 errors and unhandled errors without status
  if (err && (err.status === 500 || !err.status)) {
    const error = new BaseCustomError("Internal Server Error", {
      title: "Internal Server Error",
      status: 500,
      errors: {
        message: process.env.NODE_ENV === 'production'
          ? "Internal Server Error"
          : (err.message || "Internal Server Error"),
        details: process.env.NODE_ENV === 'production'
          ? "An unexpected error occurred"
          : err.stack
      }
    });
    next(error);
  } else {
    // Pass to next error handler if this has a different status code
    next(err);
  }
  log.retrn("error500_InternalServer", log.kcarb)
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
