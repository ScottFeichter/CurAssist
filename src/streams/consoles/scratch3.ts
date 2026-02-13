// // console.infor
// (customConsole as CustomConsole).infor = function(data?: any, ...args: any[]) {
//     // Always write to file
//     writeToConsoleAndFile(`${GREY_COLOR}[console] INFOR :`, data, false, GREY_COLOR, ...args);

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
