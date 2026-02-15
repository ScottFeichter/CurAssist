import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { Request } from 'express';
import { RequestDetails } from '../../../../types/ts-definitions';

console.enter();

// #region ====================== START ========================================


export const getRequestDetails = (req: Request, importantHeaders: any): RequestDetails => {
  log.enter("getRequestDetails", log.brack);
  const details = {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: importantHeaders,
  };
  log.retrn("getRequestDetails", log.kcarb);
  return details;
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
