// #region ===================== IMPORTS =======================================
import fs from 'fs';
import path from 'path';
// #endregion ------------------------------------------------------------------

// Note: This file sets up the custom console, so it doesn't use console.enter/leave

// #region ====================== START ========================================




// ANSI color codes
export const GREY_COLOR = '\x1b[90m';               // Keys and default text
export const CYAN_COLOR = '\x1b[36m';               // Values
export const YELLOW_COLOR = '\x1b[33m';             // Yellow text
export const RESET_COLOR = '\x1b[0m';
export const BLACK_ON_YELLOW = '\x1b[30m\x1b[43m';  // Black text on yellow background
export const BLACK_COLOR = '\x1b[30m';              // Black text
export const WHITE_COLOR = '\x1b[37m';              // Normal white
export const BRIGHT_WHITE_COLOR = '\x1b[97m';       // Bright white




// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}


// Create write streams for the log files
export const logFileNoAnsi = fs.createWriteStream(path.join(logsDir, 'all-no-ansi.log'), { flags: 'a' });
export const logFileWithAnsi = fs.createWriteStream(path.join(logsDir, 'all-w-ansi.log'), { flags: 'a' });


// Environment variable checks to toggle logs
export const isEnterEnabled = (NODE_ENV: string): boolean => {
    if (NODE_ENV !== 'production') return true;
    return false
}
export const isLeaveEnabled = (NODE_ENV: string): boolean => {
    if (NODE_ENV !== 'production') return true;
    return false
}
export const isInforEnabled = (NODE_ENV: string): boolean => {
    return true;
}
export const isSuperEnabled = (NODE_ENV: string): boolean => {
    if (NODE_ENV !== 'production') return true;
    return false
}





 // #endregion ------------------------------------------------------------------
