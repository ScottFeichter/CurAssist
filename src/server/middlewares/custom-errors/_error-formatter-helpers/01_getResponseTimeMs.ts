
import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';

console.enter();

// #region ====================== START ========================================


export const getResponseTimeMs = (startTime?: [number, number]): string => {
  log.enter("getResponseTimeMs", log.brack);

  // If no startTime provided, return '0.000'
  if (!startTime) return '0.000';

  // Calculate the time difference using process.hrtime
  const [seconds, nanoseconds] = process.hrtime(startTime);

  // Convert to milliseconds with 3 decimal places
  const convertedTime = (seconds * 1000 + nanoseconds / 1000000).toFixed(3);

  log.retrn("getResponseTimeMs", log.kcarb);
  return convertedTime;
};


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
