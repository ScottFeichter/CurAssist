import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { createTxReport } from './_error-formatter-helpers/00_createTxReport';
import { getErrorPagePath } from './_error-formatter-helpers/10_getErrorPagePath';
import { renderErrorResponse } from './_error-formatter-helpers/20_renderErrorResponse';

console.enter();

// #region ====================== START ========================================

export const _errorFormatter = ((
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  log.enter("_errorFormatter", log.brack);

  const txReport = createTxReport(req, err);
  const errorPagePath = getErrorPagePath(err.status);

  res.on('finish', () => {
    log.error("Transaction Report", txReport);
  });

  renderErrorResponse(res, txReport, errorPagePath);

  log.retrn("_errorFormatter", log.kcarb);
});

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
