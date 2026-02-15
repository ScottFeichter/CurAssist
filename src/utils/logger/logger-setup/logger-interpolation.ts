import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import logger from "../logger";
import { log } from "./logger-wrapper";
import { logDir } from "../logger-config/logger-paths";

console.enter();

// #region ====================== START ========================================

// !!! THIS FILE IS NOT INTENDED TO RUN IT IS FOR NOTES ABOUT LOGGING

let someOtherValue;
let someVar = "someVar";

//-----------------------------------------------------------------------------

// WE ARE USING A CUSTOM API WRAPPER SO LOGGER CAN HANDLE MULTIPLE ARGUMENTS

// WE TRIED TO MAKE IT AS SIMILAR TO CONSOLE.LOG AS PRACTICLE

log.infor('logIt:', log.arrow, someVar);
log.blank();


// THEREFORE THE INFORMATION BELOW MAY NOT BE RELEVANT FOR THIS PROJECT

//----------------------------------------------------------------------

// To pass variables to the Winston logger similar to console.log use:
// - template literals,
// - object interpolation,
// - Winston's built-in interpolation.

// Here are several ways to do it:

// 1. Using template literals (recommended):
logger.infor(`logDir: ----------------> ${logDir}`);

// 2. Using object interpolation:
logger.infor('logDir: ---------------->', { logDir });

// 3. Using Winston's built-in interpolation:
logger.infor('logDir: ----------------> %s', logDir);

// 4. If you want to log multiple values:
logger.infor('logDir: ---------------->', logDir, 'additional value:', someOtherValue);

// 5. If you're logging an object and want to ensure proper object serialization:
logger.infor('logDir: ---------------->', JSON.stringify(logDir, null, 2));


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
