import path from 'path';
import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../logger-setup/logger-wrapper';

console.enter();

// #region ====================== START ========================================

export const getLastThreeLevels = (fullPath: string): string => {
    log.enter("getLastThreeLevels()", log.brack);
    try {
        if (!fullPath) {
            log.retrn("getLastThreeLevels()", log.kcarb);
            return 'No path provided';
        }

        const lastLevel = path.basename(fullPath);
        const parentLevel = path.basename(path.dirname(fullPath));
        const grandParentLevel = path.basename(path.dirname(path.dirname(fullPath)));

        // Build the path based on available levels
        if (!parentLevel) {
            log.retrn("getLastThreeLevels()", log.kcarb);
            return lastLevel;
        }
        if (!grandParentLevel) {
            log.retrn("getLastThreeLevels()", log.kcarb);
            return path.join(parentLevel, lastLevel);
        }
        log.retrn("getLastThreeLevels()", log.kcarb);
        return path.join(grandParentLevel, parentLevel, lastLevel);

    } catch (error: unknown) {
        if (error instanceof Error) {
            log.retrn("getLastThreeLevels()", log.kcarb);
            return `Invalid path: ${error.message}`;
        }
        log.retrn("getLastThreeLevels()", log.kcarb);
        return 'Invalid path: Unknown error';
    }
};

// Test cases with types:
type TestCase = {
    input: string | null;
    expected: string;
    description: string;
};

const testCases: TestCase[] = [
    {
        input: '/single',
        expected: 'single',
        description: 'Single level path'
    },
    {
        input: '/first/second',
        expected: path.join('first', 'second'),
        description: 'Two level path'
    },
    {
        input: '/first/second/third',
        expected: path.join('first', 'second', 'third'),
        description: 'Three level path'
    },
    {
        input: '/first/second/third/fourth',
        expected: path.join('second', 'third', 'fourth'),
        description: 'Four level path'
    },
    {
        input: '',
        expected: 'No path provided',
        description: 'Empty string'
    },
    {
        input: null,
        expected: 'No path provided',
        description: 'Null input'
    }
];

// Run tests
// testCases.forEach((testCase: TestCase) => {
//     console.log(`
//       Tests for getLastThreeLevels in logger-clearpath.ts
//       `
//     );
//     const result = getLastThreeLevels(testCase.input as string);
//     console.log(`Test: ${testCase.description}`);
//     console.log(`Input: ${testCase.input}`);
//     console.log(`Expected: ${testCase.expected}`);
//     console.log(`Actual: ${result}`);
//     console.log(`Pass: ${result === testCase.expected}\n`);
// });


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
