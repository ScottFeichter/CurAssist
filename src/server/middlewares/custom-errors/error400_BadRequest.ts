import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error400_BadRequest = (
  err: Error | BaseCustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error400_BadRequest", log.brack);

  // Check for specific 400 conditions
  const is400Error = (
    // Explicit 400 status
    (err as any).status === 400 ||
    (err as any).statusCode === 400 ||

    // SyntaxError (like malformed JSON)
    err instanceof SyntaxError ||

    // Common 400-type error names
    err.name === 'BadRequestError' ||

    // Check for specific error types from body-parser, etc
    (err as any).type === 'entity.parse.failed' ||
    (err as any).type === 'entity.too.large'
  );

  if (is400Error) {
    if (err instanceof BaseCustomError && err.status === 400) { // If it's already a BaseCustomError with status 400, pass it through
      log.retrn("error400_BadRequest", log.kcarb);
      return next(err);
    }


    const error = new BaseCustomError("Bad Request", {  // Otherwise, transform to BaseCustomError
      title: "Bad Request",
      status: 400,
      errors: {
        message: err.message || "Bad Request",
        type: (err as any).type || 'bad_request',
        details: (err as any).details || undefined
      },
      cause: err
    });
    log.retrn("error400_BadRequest", log.kcarb);
    return next(error);
  }

  log.retrn("error400_BadRequest", log.kcarb);
  return next(err); // Not a 400 error, pass through unchanged


};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
