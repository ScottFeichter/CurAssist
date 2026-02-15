// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import winston from "winston";
// #endregion ------------------------------------------------------------------

console.enter();

// #region ====================== START ========================================


// Create a custom format for the timestamp
export const customTimestamp = winston.format((info) => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(4, '0');  // Pad to 4 digits

  info.timestamp = `[${month}-${day}-${year} ${hours}:${minutes}:${seconds}:${ms}]`;
  return info;
});


// #endregion ------------------------------------------------------------------

console.leave();;

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
