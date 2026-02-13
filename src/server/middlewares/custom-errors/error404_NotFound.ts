import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error404_NotFound = (
  err: Error | BaseCustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error404_NotFound", log.brack);

  const is404Error = (
    // Explicit 404 status
    (err as any).status === 404 ||
    (err as any).statusCode === 404 ||

    // Not Found specific errors
    err.name === 'NotFoundError' ||
    err.name === 'notFoundError' ||

    (err as any).title === 'notFoundError' ||

    // Common file/resource not found errors
    (err as any).code === 'ENOENT' ||
    (err as any).type === 'resource.notfound' ||
    (err as any).type === 'Resource.NotFound' ||
    (err as any).type === 'entity.notfound' ||

    // Database not found indicators
    (err as any).reason === 'document_not_found' ||
    (err as any).reason === 'record_not_found'
  );


  if (is404Error) {                                                             // Check if it is a 404

    if (err instanceof BaseCustomError && err.status === 404) {                 // Check if it is already a BaseCustomError

      const errorLocation = new Error().stack?.split('\n')[1] || '';            // Add error404_NotFound to the stack for pass-through case
      err.stack = `${err.stack}\n${errorLocation}`;


      return next(err);
    } else {
      const error = new BaseCustomError("Not Found", {                           // If not already then transform to BaseCustomError
        title: "Resource Not Found",
        status: 404,
        errors: {
          message: err.message || "The requested resource couldn't be found",
          type: (err as any).type || 'not_found',
          code: (err as any).code,
          details: (err as any).details || "The requested resource does not exist or was not found",
          reason: (err as any).reason
        },
        cause: err
      });


      log.retrn("error404_NotFound", log.kcarb);                                // Send the newly created BaseCustomerError to next
      return next(error);
    }
  }

  log.retrn("error404_NotFound", log.kcarb);
  return next(err);                                                             // Not a 404 error, pass through unchanged
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================


/*
  We structure the res.send as above due to the fact that it is async.
*/

/*
  404 Not Found:
  - Resource does not exist at the specified URL
  - Can be temporary (resource might be created later) or permanent
  - Common for both API endpoints and static resources
  - Should be used when hiding the existence of a resource from unauthorized users
*/



// #endregion ------------------------------------------------------------------
