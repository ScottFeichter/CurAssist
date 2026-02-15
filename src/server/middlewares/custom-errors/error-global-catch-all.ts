import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error_globalCatchAll = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error_globalCatchAll", log.brack);
  // If it's already a handled error type, pass it through
  if (err instanceof BaseCustomError) {
    log.retrn("error_globalCatchAll", log.kcarb);
    return next(err);
  }

  // For unexpected errors:
  log.error('Unexpected Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });


  // Convert to BaseCustomError but maintain original info
  const unexpectedError = new BaseCustomError(err.message, {
    title: 'Internal Server Error',
    status: 500,
    cause: err
  });

  next(unexpectedError);
  log.retrn("error_globalCatchAll", log.kcarb);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
