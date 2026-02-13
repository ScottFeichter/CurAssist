import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';

console.enter();

// #region ====================== START ========================================



  // Helper to sanitize header info
  export const sanitizeHeaders = (headers: any) => {
    log.enter("sanitizeHeaders", log.brack);

    const sanitized = { ...headers };

    // Mask sensitive data
    if (sanitized.authorization) sanitized.authorization = '[REDACTED]';
    if (sanitized.cookie) sanitized.cookie = '[REDACTED]';

    log.retrn("sanitizeHeaders", log.kcarb);
    return sanitized;
  };



// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
