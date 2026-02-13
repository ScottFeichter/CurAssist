// import util from 'util';
// import stripAnsi from 'strip-ansi';
// import {
//     logFileNoAnsi,
//     logFileWithAnsi,
//     GREY_COLOR,
//     CYAN_COLOR,
//     YELLOW_COLOR,
//     RESET_COLOR,
//     BLACK_ON_YELLOW,
// } from './customConsoleSetup';

// // #region ====================== START ========================================




// // Helper function for the date formatting
// export function formatTimestamp(): string {
//     const now = new Date();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const day = String(now.getDate()).padStart(2, '0');
//     const year = now.getFullYear();
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
//     const milliseconds = String(now.getMilliseconds()).padStart(4, '0');

//     return `[${month}-${day}-${year} ${hours}:${minutes}:${seconds}:${milliseconds}]`;
// }



// // Helper function to colorize values for super console
// export function colorizeSuperValues(data: any, indent: string = '    '): string {
//     if (data === null) {
//         return `${YELLOW_COLOR}null${RESET_COLOR}`;
//     }

//     if (Array.isArray(data)) {
//         if (data.length === 0) return '[]';
//         const items = data.map(item => colorizeSuperValues(item, indent + '    ')).join(',\n' + indent + '    ');
//         return `[\n${indent}    ${items}\n${indent}]`;
//     }

//     if (typeof data === 'object' && data !== null) {
//         const entries = Object.entries(data);
//         if (entries.length === 0) return '{}';
//         const formattedEntries = entries.map(([key, value]) =>
//             `${key}: ${colorizeSuperValues(value, indent + '    ')}`
//         ).join(',\n' + indent + '    ');
//         return `{\n${indent}    ${formattedEntries}\n${indent}}`;
//     }

//     if (typeof data === 'string') {
//         return `${YELLOW_COLOR}"${data}"${RESET_COLOR}`;
//     }

//     return `${YELLOW_COLOR}${data}${RESET_COLOR}`;
// }



// // Helper function to check if value needs multiline display
// export function needsMultilineDisplay(value: any): boolean {
//     return typeof value === 'object' && value !== null && !Array.isArray(value) ||
//            (Array.isArray(value) && value.length > 0);
// }



// // Helper function to colorize object values for infor
// export function colorizeValues(data: any): string {
//     if (data === null) {
//         return `${CYAN_COLOR}null${RESET_COLOR}${GREY_COLOR}`;
//     }

//     if (Array.isArray(data)) {
//         const items = data.map(item => colorizeValues(item)).join(`, `);
//         return `[${items}]`;
//     }

//     if (typeof data === 'object') {
//         const entries = Object.entries(data).map(([key, value]) =>
//             `${key}: ${colorizeValues(value)}`
//         );
//         return `{ ${entries.join(', ')} }`;
//     }

//     if (typeof data === 'string') {
//         return `${CYAN_COLOR}"${data}"${RESET_COLOR}${GREY_COLOR}`;
//     }

//     return `${CYAN_COLOR}${data}${RESET_COLOR}${GREY_COLOR}`;
// }



// // Helper function to get caller information
// export function getCallerInfo() {
//     const err = new Error();
//     const stack = err.stack?.split('\n');
//     if (!stack) return { fileName: '', lineNumber: '' };

//     for (let i = 3; i < stack.length; i++) {
//         const line = stack[i];
//         if (!line.includes('customConsoles.ts')) {
//             const match = line.match(/[\/\\]([^\/\\]+\.[jt]s):(\d+):/);
//             if (match) {
//                 return {
//                     fileName: match[1],
//                     lineNumber: match[2]
//                 };
//             }
//         }
//     }
//     return { fileName: '', lineNumber: '' };
// }



// // Helper function to get the caller's filename
// export function getCallerFileName() {
//     return getCallerInfo().fileName;
// }




// export function writeToConsoleAndFile(prefix: string, data?: any, addLineBreak: boolean = false, useColor: string = '', ...args: any[]) {
//     const timestamp = formatTimestamp();
//     let consoleMessage: string;
//     let fileMessage: string;

//     if (typeof data === 'object' && data !== null) {
//         consoleMessage = `${GREY_COLOR}${colorizeValues(data)}`;
//         fileMessage = stripAnsi(`${colorizeValues(data)}`);
//     } else {
//         consoleMessage = data !== undefined ? `${useColor}${util.format(data, ...args)}` : '';
//         fileMessage = data !== undefined ? stripAnsi(util.format(data, ...args)) : '';
//     }

//     // Write to file without ANSI codes
//     const fullFileMessage = `${timestamp} ${prefix} ${fileMessage}`;
//     logFileNoAnsi.write(fullFileMessage + '\n');

//     // Write to file with ANSI codes
//     const fullColoredMessage = `${timestamp} ${prefix} ${consoleMessage}`;
//     logFileWithAnsi.write(fullColoredMessage + '\n');

//     // Return the console message for the calling function to handle
//     return `${prefix} ${consoleMessage}`;
// }


// // #endregion ------------------------------------------------------------------
