import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error403_Forbidden = (
  err: Error | BaseCustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error403_Forbidden", log.brack);

  const is403Error = (
    // Explicit 403 status
    (err as any).status === 403 ||
    (err as any).statusCode === 403 ||

    // Authorization specific errors
    err.name === 'ForbiddenError' ||
    err.name === 'AuthorizationError' ||

    // Common authorization-related error types
    (err as any).type === 'access.forbidden' ||
    (err as any).type === 'permission.denied' ||
    (err as any).code === 'access_denied' ||

    // Permission or access status indicators
    (err as any).reason === 'insufficient_permissions' ||
    (err as any).reason === 'access_restricted'
  );

  if (is403Error) {
    if (err instanceof BaseCustomError && err.status === 403) { // If it's already a BaseCustomError with status 403, pass it through
      log.retrn("error403_Forbidden", log.kcarb);
      return next(err);
    }

    // Transform to BaseCustomError
    const error = new BaseCustomError("Forbidden", {
      title: "Forbidden",
      status: 403,
      errors: {
        message: err.message || "Access to this resource is forbidden",
        type: (err as any).type || 'forbidden',
        code: (err as any).code,
        details: (err as any).details || "You don't have permission to access this resource",
        reason: (err as any).reason
      },
      cause: err
    });

    log.retrn("error403_Forbidden", log.kcarb);
    return next(error);
  }

  log.retrn("error403_Forbidden", log.kcarb);
  return next(err); // Not a 403 error, pass through unchanged
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================
/*
  403 Forbidden:
  - Different from 401 (Unauthorized) as the client is authenticated
  - Indicates the client doesn't have necessary permissions
  - Used when access to resource is permanently forbidden
  - Client should not repeat the request without modifications
*/
// #endregion ------------------------------------------------------------------
