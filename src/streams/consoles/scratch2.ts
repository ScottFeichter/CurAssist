// import { Console } from 'console';
// import util from 'util';
// import {
//     formatTimestamp,
//     colorizeSuperValues,
//     needsMultilineDisplay,
//     colorizeValues,
//     writeToConsoleAndFile,
//     getCallerInfo,
//     getCallerFileName,
//  } from './customConsoleMethods';
// import {
//     isEnterEnabled,
//     isLeaveEnabled,
//     isInforEnabled,
//     isSuperEnabled,
//     GREY_COLOR,
//     CYAN_COLOR,
//     YELLOW_COLOR,
//     RESET_COLOR,
//     BLACK_ON_YELLOW,
//     logFileNoAnsi,
//     logFileWithAnsi
// } from './customConsoleSetup';


// // #region ====================== START ========================================


// // Create custom console
// const customConsole = new Console({
//     stdout: process.stdout,
//     stderr: process.stderr
// });

// // Helper functions for path handling
// const formatPath = (path: string): string => {
//     const parts = path.split(/[\/\\]/);
//     // Handle empty strings that result from leading slash
//     return parts.map((part, index) => {
//         if (!part && index === 0) {
//             // Handle leading slash
//             return `    ${YELLOW_COLOR}/${RESET_COLOR}`;
//         }
//         if (!part) {
//             // Handle empty strings from double slashes
//             return ``;
//         }
//         if (index === parts.length - 1 && /\.[^/\\]+$/.test(part)) {

//             // Handle file at end
//             return `${YELLOW_COLOR}${part}${RESET_COLOR}`;
//         }
//         // Handle directories
//         return `${YELLOW_COLOR}${part}/${RESET_COLOR}`;
//     }).filter(Boolean).join('\n    ');
// };



// const isLikelyPath = (str: string): boolean => {
//     return typeof str === 'string' &&
//         (str.includes('/') || str.includes('\\')) &&
//         /\.(js|ts|jsx|tsx|html|css|json|md|yml|yaml|txt|log)$/i.test(str);
// };



// // Extend console with custom methods
// interface CustomConsole extends Console {
//     enter(data?: any, ...args: any[]): void;
//     leave(data?: any, ...args: any[]): void;
//     infor(data?: any, ...args: any[]): void;
//     super(itemName: string, ...args: any[]): void;
// }

// // Add custom methods
// (customConsole as CustomConsole).enter = function(data?: any, ...args: any[]) {
//     const fileName = getCallerFileName();
//     const message = data !== undefined ? ` ${util.format(data, ...args)}` : '';

//     // Always write to file
//     writeToConsoleAndFile('[console] ENTER :', fileName + message, false, '', ...args);

//     // Only log to console if enabled
//     if (isEnterEnabled(process.env.NODE_ENV)) {
//         console.log(`[console] ENTER : ${fileName}${message}`);
//     }
// };

// (customConsole as CustomConsole).leave = function(data?: any, ...args: any[]) {
//     const fileName = getCallerFileName();
//     const message = data !== undefined ? ` ${util.format(data, ...args)}` : '';

//     // Always write to file
//     writeToConsoleAndFile('[console] LEAVE :', fileName + message, true, '', ...args);

//     // Only log to console if enabled
//     if (isLeaveEnabled(process.env.NODE_ENV)) {
//         console.log(`[console] LEAVE : ${fileName}${message}\n`);
//     }
// };

// (customConsole as CustomConsole).infor = function(data?: any, ...args: any[]) {
//     // Always write to file
//     writeToConsoleAndFile('[console] INFOR :', data, false, GREY_COLOR, ...args);

//     // Only log to console if enabled
//     if (isInforEnabled(process.env.NODE_ENV)) {
//         let message: string;
//         if (typeof data === 'object' && data !== null) {
//             message = `${GREY_COLOR}${colorizeValues(data)}`;
//         } else {
//             message = data !== undefined ? `${GREY_COLOR}${util.format(data, ...args)}` : '';
//         }
//         console.log(`${GREY_COLOR}[console] INFOR : ${message}${RESET_COLOR}`);
//     }
// };



// (customConsole as CustomConsole).super = function(itemName: string, ...args: any[]) {
//     const { fileName, lineNumber } = getCallerInfo();
//     const baseMessage = `FILE: ${fileName} LINE: ${lineNumber} ITEM: ${itemName} RESOLVE:`;

//     // Check for paths and complex args
//     const hasPath = args.length > 0 && isLikelyPath(args[0]);
//     const hasComplexArg = args.some(arg => typeof arg === 'object' && arg !== null);

//     // Always write to file
//     let resolveValue: string;

//     if (hasPath) {
//         // For file writing, strip the color codes
//         const stripColors = (str: string) => str.replace(/\x1b\[\d+m/g, '');
//         const formattedPath = formatPath(args[0]);
//         resolveValue = '\n    ' + stripColors(formattedPath) + '\n';
//         const timestamp = formatTimestamp();
//         logFileNoAnsi.write(`${timestamp} [console] SUPER : ${baseMessage}${resolveValue}`);
//         logFileWithAnsi.write(`${timestamp} [console] SUPER : ${baseMessage}${resolveValue}`);
//     } else if (!hasComplexArg) {
//         resolveValue = args.length > 0 ? util.format(...args) : '';
//         const timestamp = formatTimestamp();
//         logFileNoAnsi.write(`${timestamp} [console] SUPER : ${baseMessage} ${resolveValue}\n`);
//         logFileWithAnsi.write(`${timestamp} [console] SUPER : ${baseMessage} ${resolveValue}\n`);
//     } else {
//         resolveValue = '\n';
//         args.forEach((arg, index) => {
//             if (typeof arg === 'object' && arg !== null) {
//                 resolveValue += '    ' + colorizeSuperValues(arg);
//             } else {
//                 resolveValue += '    ' + `${YELLOW_COLOR}${util.format(arg)}${RESET_COLOR}`;
//             }
//             if (index < args.length - 1) {
//                 resolveValue += '\n';
//             }
//         });

//         const timestamp = formatTimestamp();
//         const stripColors = (str: string) => str.replace(/\x1b\[\d+m/g, '');
//         logFileNoAnsi.write(`${timestamp} [console] SUPER : ${baseMessage}${stripColors(resolveValue)}\n`);
//         logFileWithAnsi.write(`${timestamp} [console] SUPER : ${baseMessage}${stripColors(resolveValue)}\n`);
//     }

//     // Only log to console if enabled
//     if (isSuperEnabled(process.env.NODE_ENV)) {
//         if (hasPath) {
//             console.log(`${BLACK_ON_YELLOW}[console] SUPER : ${baseMessage}${RESET_COLOR}`);
//             const formattedPath = formatPath(args[0]);
//             console.log(`${formattedPath}\n`);
//         } else if (!hasComplexArg) {
//             console.log(`${BLACK_ON_YELLOW}[console] SUPER : ${baseMessage} ${resolveValue}${RESET_COLOR}`);
//         } else {
//             console.log(`${BLACK_ON_YELLOW}[console] SUPER : ${baseMessage}${RESET_COLOR}${resolveValue}`);
//         }
//     }
// };

// // Export the extended console
// export const extendedConsole = customConsole as CustomConsole;

// // #endregion ------------------------------------------------------------------
