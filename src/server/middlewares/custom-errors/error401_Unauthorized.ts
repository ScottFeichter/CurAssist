import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error401_Unauthorized = (
  err: Error | BaseCustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error401_Unauthorized", log.brack);

  const is401Error = (
    // Explicit 401 status
    (err as any).status === 401 ||
    (err as any).statusCode === 401 ||

    // Authentication specific errors
    err.name === 'UnauthorizedError' ||
    err.name === 'AuthenticationError' ||

    // JWT specific errors
    (err as any).name === 'JsonWebTokenError' ||
    (err as any).name === 'TokenExpiredError' ||

    // Common auth-related error types
    (err as any).type === 'credentials.invalid' ||
    (err as any).type === 'token.expired' ||
    (err as any).code === 'credentials_required'
  );

  if (is401Error) {

    if (err instanceof BaseCustomError && err.status === 401) { // If it's already a BaseCustomError with status 401, pass it through
      log.retrn("error401_Unauthorized", log.kcarb);
      return next(err);
    }

    // Transform to BaseCustomError
    const error = new BaseCustomError("Unauthorized", {
      title: "Unauthorized",
      status: 401,
      errors: {
        message: err.message || "Authentication required",
        type: (err as any).type || 'unauthorized',
        code: (err as any).code,
        details: (err as any).details || undefined
      },
      cause: err
    });

    log.retrn("error401_Unauthorized", log.kcarb);
    return next(error);
  }

  log.retrn("error401_Unauthorized", log.kcarb);
  return next(err); // Not a 401 error, pass through unchanged

};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
