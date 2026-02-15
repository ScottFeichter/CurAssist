import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { selectViewHTML } from './11_selectViewHTML';
import { join } from 'path';

console.enter();

// #region ====================== START ========================================


export const getErrorPagePath = (status: number): string => {
  log.enter("getErrorPagePath", log.brack);

  const viewPath = selectViewHTML(status);
  const errorPagePath = join(__dirname, '../../../../views', viewPath);

  log.retrn("getErrorPagePath", log.kcarb);
  return errorPagePath;
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
