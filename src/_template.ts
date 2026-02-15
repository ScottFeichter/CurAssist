import { extendedConsole as console } from './streams/consoles/customConsoles';
import { log } from './utils/logger/logger-setup/logger-wrapper';


console.enter();

// #region ====================== START ========================================

log.enter("someFunc", log.brack);

// Code goes here

log.retrn("someFunc", log.kcarb);

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
