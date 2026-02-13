import path from "path";
import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import fs from 'fs';
import { logDir } from "../logger-config/logger-paths";
import { getLastThreeLevels } from "./logger-clearpath";

console.enter();

// #region ====================== START ========================================


const shortPath = getLastThreeLevels(logDir);                    // Check the last 3 levels of path to the log directories:
console.infor("shortPath via logDir: ----------> ", shortPath);  // Print the last three levels of the path or two or one depending

// This will output something like: mar15-03-15-2025-2/backend-mar15-03-15-2025-2/logs


// Function to create directories if they don't exist
export const createLogDirectories = () => {
    const dirs = [
        logDir,
        path.join(logDir, 'warni'),
        path.join(logDir, 'error'),
        path.join(logDir, 'infor'),
        path.join(logDir, 'https'),
        path.join(logDir, 'debug'),
        path.join(logDir, 'enter'),
        path.join(logDir, 'retrn'),
    ];

    dirs.forEach(dir => {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.infor("Created directory: ----------> ", getLastThreeLevels(dir));
            }
        } catch (error) {
            console.error(`[console] ERROR : Error creating directory ${dir}:`, error);
        }
    });
};


// Ensure the function is actually being called and directories created
try {
    createLogDirectories();
    console.infor('All log directories created successfully!');
} catch (error) {
    console.error(`[console] ERROR :`, 'Failed to create log directories:', error);
}


// Create log files after creating directories
const testLogFile = path.join(logDir, 'test.log');


// Ensure the function is actually being called and files created
try {
    fs.writeFileSync(testLogFile, 'Test log entry\n');
    console.infor('All log files created successfully!');
} catch (error) {
    console.error(`[console] ERROR :`, 'Failed to create test log file:', error);
}


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
