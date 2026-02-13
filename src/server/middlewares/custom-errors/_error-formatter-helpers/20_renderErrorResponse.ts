import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Response } from 'express';
import { TransactionReport } from '@/types/ts-definitions';

console.enter();

// #region ====================== START ========================================



export const renderErrorResponse = (
  res: Response,
  txReport: TransactionReport,
  errorPagePath: string
): void => {
  log.enter("renderErrorResponse", log.brack);

  res.status(txReport.RESPONSE.status)
    .render(errorPagePath, {
      txReport,
      script: `<script>
        document.addEventListener('DOMContentLoaded', () => {
          const txReport = ${JSON.stringify(txReport)};
          displayTxReport(txReport);
        });
      </script>`
    });

  log.retrn("renderErrorResponse", log.kcarb);
};


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
