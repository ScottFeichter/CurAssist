import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from '../../middlewares/custom-errors/base-custom-error';


console.enter();

// #region ====================== START ========================================


export const routeCatchAll = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("routeCatchAll", log.brack);

  const notFoundError = new BaseCustomError("Not Found", {
    title: "Resource Not Found",
    status: 404,
    errors: {
      message: "The requested resource couldn't be found",
      path: req.originalUrl,
      method: req.method
    }
  });

  log.retrn("routeCatchAll", log.kcarb);
  next(notFoundError);
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
