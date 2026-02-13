import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';


console.enter();

// #region ====================== START ========================================



  // Helper to normalize an undefined to the string 'undefined'
  export const normalizeValue = (value: any): string => {
    log.enter("normalizeValue", log.brack);
    log.retrn("normalizeValue", log.kcarb);
    return  value === undefined ? 'undefined' : value;
  }




// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
