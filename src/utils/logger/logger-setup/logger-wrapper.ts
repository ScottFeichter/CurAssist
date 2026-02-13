import path from 'path';
import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import util from 'util';
import logger from '../logger';

console.enter();

// #region ====================== START ========================================


type LogFunction = (...args: any[]) => void;

interface CustomLogger {
    error: LogFunction;
    warni: LogFunction;
    infor: LogFunction;
    https: LogFunction;
    debug: LogFunction;
    enter: LogFunction;
    retrn: LogFunction;
    blank: () => void;
    arrow: string;
    worra: string;
    brack: string;
    kcarb: string;
}

export const log: CustomLogger = {
    error: (...args: any[]) => {
        const formattedArgs = formatArgsWithWrapping(args);
        logger.error(formattedArgs);
    },
    warni: (...args: any[]) => {
        const formattedArgs = formatArgsWithWrapping(args);
        logger.warni(formattedArgs);
    },
    infor: (...args: any[]) => {
        const formattedArgs = formatArgsWithWrapping(args);
        logger.infor(formattedArgs);
    },
    https: (...args: any[]) => {
        const formattedArgs = formatArgsWithWrapping(args);
        logger.https(formattedArgs);
    },
    debug: (...args: any[]) => {
        const formattedArgs = formatArgsWithWrapping(args);
        logger.debug(formattedArgs);
    },
    enter: (...args: any[]) => {
        const formattedArgs = formatArgsWithWrapping(args);
        logger.enter(formattedArgs);
    },
    retrn: (...args: any[]) => {
        const formattedArgs = formatArgsWithWrapping(args);
        logger.retrn(formattedArgs);
    },

    blank: () => console.log('\n'),

    arrow: ' -----------> ',
    worra: ' <----------- ',
    brack: `=> {`,
    kcarb: `<= };`
};


// Helper to format logs better in the console?
const formatArgsWithWrapping = (args: any[]): string => {
    if (args.length === 0) {
        return '';
    }

    const baseIndentation = '[winston] LEVEL : '.length;
    const objectIndentation = ' '.repeat(baseIndentation + 2); // +2 for objects/arrays
    const normalIndentation = ' '.repeat(baseIndentation);     // no +2 for other types

    // Check if any argument is an object or array
    const hasObjectOrArray = args.some(arg =>
        typeof arg === 'object' && arg !== null
    );

    let result = '';
    let previousWasObjectOrArray = false;

    args.forEach((arg, index) => {
        const isLast = index === args.length - 1;
        const isObjectOrArray = typeof arg === 'object' && arg !== null;

        if (isObjectOrArray) {
            // Format objects and arrays with extra indentation
            const inspected = util.inspect(arg, {
                depth: null,
                colors: true,
                breakLength: 80,
                compact: false,
                maxArrayLength: null
            });

            result += '\n' + objectIndentation +
                     inspected.split('\n').join('\n' + objectIndentation);
            previousWasObjectOrArray = true;
        } else {
            // For primitives
            if (previousWasObjectOrArray) {
                // If previous was object/array, indent this argument (but without extra spaces)
                result += '\n' + normalIndentation + String(arg);
            } else {
                // If previous wasn't object/array, just add space
                if (result) result += ' ';
                result += String(arg);
            }
            previousWasObjectOrArray = false;
        }

        // Add newline if this is the last argument and we had any objects/arrays
        if (isLast && hasObjectOrArray) {
            result += '\n';
        }
    });

    return result;
};

// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
