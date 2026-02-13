import util from 'util';
import stripAnsi from 'strip-ansi';
import {
    logFileNoAnsi,
    logFileWithAnsi,
    GREY_COLOR,
    CYAN_COLOR,
    YELLOW_COLOR,
    BLACK_COLOR,
    WHITE_COLOR,
    BRIGHT_WHITE_COLOR,
    RESET_COLOR,
    BLACK_ON_YELLOW,
} from './customConsoleSetup';



// #region ====================== START ========================================




// Helper function for the date formatting
export function formatTimestamp(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(4, '0');

    return `[${month}-${day}-${year} ${hours}:${minutes}:${seconds}:${milliseconds}]`;
}



// Helper function to colorize values for super console
export function colorizeSuperValues(data: any, indent: string = '    '): string {
    if (data === null) {
        return `${YELLOW_COLOR}null${RESET_COLOR}`;
    }

    if (Array.isArray(data)) {
        if (data.length === 0) return '[]';
        const items = data.map(item => colorizeSuperValues(item, indent + '    ')).join(',\n' + indent + '    ');
        return `[\n${indent}    ${items}\n${indent}]`;
    }

    if (typeof data === 'object' && data !== null) {
        const entries = Object.entries(data);
        if (entries.length === 0) return '{}';
        const formattedEntries = entries.map(([key, value]) =>
            `${key}: ${colorizeSuperValues(value, indent + '    ')}`
        ).join(',\n' + indent + '    ');
        return `{\n${indent}    ${formattedEntries}\n${indent}}`;
    }

    if (typeof data === 'string') {
        return `${YELLOW_COLOR}"${data}"${RESET_COLOR}`;
    }

    return `${YELLOW_COLOR}${data}${RESET_COLOR}`;
}



// Helper function to check if value needs multiline display
export function needsMultilineDisplay(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ||
           (Array.isArray(value) && value.length > 0);
}



// Helper function to colorize object values for infor
export function colorizeValues(data: any): string {
    if (data === null) {
        return `${CYAN_COLOR}null${RESET_COLOR}${GREY_COLOR}`;
    }

    if (Array.isArray(data)) {
        const items = data.map(item => colorizeValues(item)).join(`, `);
        return `[${items}]`;
    }

    if (typeof data === 'object') {
        const entries = Object.entries(data).map(([key, value]) =>
            `${key}: ${colorizeValues(value)}`
        );
        return `{ ${entries.join(', ')} }`;
    }

    if (typeof data === 'string') {
        return `${CYAN_COLOR}"${data}"${RESET_COLOR}${GREY_COLOR}`;
    }

    return `${CYAN_COLOR}${data}${RESET_COLOR}${GREY_COLOR}`;
}



// Helper function to get caller information
export function getCallerInfo() {
    const err = new Error();
    const stack = err.stack?.split('\n');
    if (!stack) return { fileName: '', lineNumber: '' };

    for (let i = 3; i < stack.length; i++) {
        const line = stack[i];
        if (!line.includes('customConsoles.ts')) {
            const match = line.match(/[\/\\]([^\/\\]+\.[jt]s):(\d+):/);
            if (match) {
                return {
                    fileName: match[1],
                    lineNumber: match[2]
                };
            }
        }
    }
    return { fileName: '', lineNumber: '' };
}



// Helper function to get the caller's filename
export function getCallerFileName() {
    return getCallerInfo().fileName;
}



// Helper to determine the vscode theme - must toggle manually if in node
const CONFIG = {
    isDarkTheme: true  // set this to false for light theme
};

export function isDarkTheme(): boolean {
    return CONFIG.isDarkTheme;
}




interface ColoredOutput {
    coloredTimestamp: string;
    coloredPrefix: string;
    coloredMessage: string;
}



// Helper to colorize custom consoles exept super
export function formatConsoleOutput(
    prefix: string,
    message: string,
    timestamp: string
): ColoredOutput {
    const consoleType = prefix.includes('[console]')
        ? prefix.split('[console]')[1].split(':')[0].trim()
        : '';

    let colorScheme: string;
    const isDark = isDarkTheme();

    switch (consoleType) {
        case 'ENTER':
            colorScheme = isDark ? BRIGHT_WHITE_COLOR : BLACK_COLOR;
            return {
                coloredTimestamp: `${colorScheme}${timestamp}${RESET_COLOR}`,
                coloredPrefix: `${colorScheme}[console] ENTER :${RESET_COLOR}`,
                coloredMessage: `${colorScheme}${message}${RESET_COLOR}`
            };

        case 'LEAVE':
            colorScheme = isDark ? BRIGHT_WHITE_COLOR : BLACK_COLOR;
            return {
                coloredTimestamp: `${colorScheme}${timestamp}${RESET_COLOR}`,
                coloredPrefix: `${colorScheme}[console] LEAVE :${RESET_COLOR}`,
                coloredMessage: `${colorScheme}${message}${RESET_COLOR}`
            };

        case 'INFOR':
            colorScheme = GREY_COLOR;
            return {
                coloredTimestamp: `${colorScheme}${timestamp}${RESET_COLOR}`,
                coloredPrefix: `${colorScheme}[console] INFOR :${RESET_COLOR}`,
                coloredMessage: `${colorScheme}${message}${RESET_COLOR}`
            };

        default:
            return {
                coloredTimestamp: timestamp,
                coloredPrefix: prefix,
                coloredMessage: message
            };
    }
}








// This is called in the custom consoles except super
export function writeToConsoleAndFile(prefix: string, data?: any, addLineBreak: boolean = false, useColor: string = '', ...args: any[]) {
    const timestamp = formatTimestamp();
    let consoleMessage: string;
    let fileMessage: string;
    let coloredMessage: string;

    if (typeof data === 'object' && data !== null) {
        consoleMessage = `${GREY_COLOR}${colorizeValues(data)}`;
        fileMessage = stripAnsi(`${colorizeValues(data)}`);
        coloredMessage = `${colorizeValues(data)}`; // Keep colors for colored log
    } else {
        consoleMessage = data !== undefined ? `${useColor}${util.format(data, ...args)}` : '';
        fileMessage = data !== undefined ? stripAnsi(util.format(data, ...args)) : '';
        coloredMessage = data !== undefined ? `${useColor}${util.format(data, ...args)}` : '';
    }

    // Get colored versions for the with-ansi log file
    const { coloredTimestamp, coloredPrefix, coloredMessage: formattedColoredMessage } =
        formatConsoleOutput(prefix, coloredMessage, timestamp);

    // Write to file without ANSI codes
    const fullFileMessage = `${timestamp} ${prefix} ${fileMessage}`;
    logFileNoAnsi.write(fullFileMessage + (addLineBreak ? '\n\n' : '\n'));

    // Write to file with ANSI codes - Don't strip colors here
    const fullColoredMessage = `${coloredTimestamp} ${coloredPrefix} ${formattedColoredMessage}`;
    logFileWithAnsi.write(fullColoredMessage + (addLineBreak ? '\n\n' : '\n'));

    return `${prefix} ${consoleMessage}`;
}


// #endregion ------------------------------------------------------------------
