import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error422_Validation = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error422_Validation", log.brack);
  // Only handle validation/unprocessable entity errors
  if (err && err.status === 422) {
    const error = new BaseCustomError("Unprocessable Entity", {
      title: "Unprocessable Entity",
      status: 422,
      errors: {
        message: err.message || "Unprocessable Entity",
        details: err.errors || "The request was well-formed but contains invalid data",
        validation: err.validation || [] // Optional array for specific validation errors
      }
    });
    next(error);
  } else {
    next(err);
  }
  log.retrn("error422_Validation", log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
