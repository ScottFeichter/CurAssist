import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';

console.enter();

// #region ====================== START ========================================

export const selectViewHTML = (status: number): string =>  {
  log.enter("someFunc", log.brack);
  switch (status) {
    case 400:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-400.html';

    case 401:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-401.html';

    case 403:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-403.html';

    case 404:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-404.html';

    case 408:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-408.html';

    case 500:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-500.html';

    case 502:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-502.html';

    case 503:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-503.html';

    case 504:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-504.html';

    default:
      log.retrn("selectViewHTML", log.kcarb);
      return 'backendHTML/error-default.html'; 
  }
}




// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
