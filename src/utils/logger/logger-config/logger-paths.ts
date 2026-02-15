// #region ===================== IMPORTS =======================================
import path from 'path';
import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ====================== START ========================================


// In your logger paths configuration
export const logDir = path.join(process.cwd(), 'logs');

export const logPaths = {
    error: path.join(logDir, 'error'),
    warni: path.join(logDir, 'warni'),
    infor: path.join(logDir, 'infor'),
    https: path.join(logDir, 'https'),
    debug: path.join(logDir, 'debug'),
    enter: path.join(logDir, 'enter'),
    retrn: path.join(logDir, 'retrn'),
    allWinston: path.join(logDir, 'allWinston'),
    all: path.join(logDir)
};


// #endregion ------------------------------------------------------------------

console.leave();;

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
