import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request } from 'express';
import { TransactionReport } from '@/types/ts-definitions';
import { getResponseDetails } from './06_getResponseDetails';
import { getRequestDetails } from './05_getRequestDetails';
import { parseStack } from './02_parseStack';
import { getImportantHeaders } from './03_getImportantHeaders';
import { getResponseTimeMs } from './01_getResponseTimeMs';


console.enter();

// #region ====================== START ========================================

export const createTxReport = (req: Request, err: any): TransactionReport => {
  log.enter("createTxReport", log.brack);

  const responseTimeMs = getResponseTimeMs((req as any).startTime);
  const parsedStack = parseStack(err.stack);
  const importantHeaders = getImportantHeaders(req.headers);

  const requestDetails = getRequestDetails(req, importantHeaders);
  const responseDetails = getResponseDetails(err, responseTimeMs, parsedStack);

  const txReport = {
    REQUEST: requestDetails,
    RESPONSE: responseDetails
  };

  log.retrn("createTxReport", log.kcarb);
  return txReport;
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
