// #region ===================== IMPORTS =======================================
import path from 'path';
import { extendedConsole as console } from '../streams/consoles/customConsoles';
import { error } from 'console';
import { config } from 'dotenv';
// #endregion ------------------------------------------------------------------


console.enter();


// #region ====================== START ========================================


// Checking that the build/run command set process.env.NODE_ENV
console.infor("process.env.NODE_ENV: ----------> ", process.env.NODE_ENV);

// Dynamically set the path depending on which environment
const envVarsFilePath = `./.env/.env.${process.env.NODE_ENV || 'development'}`;

// Log which environment file is loaded
console.infor(`envVarsFilePath:      ---------->  ${envVarsFilePath}`);


// Load environment variables from the determined file
const environmentVariables = config({ path: path.resolve(process.cwd(), envVarsFilePath) });


// Confirming the environment variables
console.super("environmentVariables", environmentVariables);


// Handle error if the .env file is not loaded correctly
if (environmentVariables.error) {
  console.error("[console] ERROR :", `Error loading environment variables from ${envVarsFilePath}`, environmentVariables.error);
  process.exit(1);  // Exit the process if env variables cannot be loaded
}


// Array for helper function to ensure required environment variables are defined
export const requiredEnvVars = [
  // 'PG_DB_HOST',
  // 'PG_DB_USERNAME',
  // 'PG_DB_PASSWORD',
  // 'PG_DB_NAME',
  // 'PG_DB_PORT',
  // 'PG_DB_DIALECT',
  'SERVER_PORT',
  'NODE_ENV',
  'BASE_URL',
  'WINSTON_LOG_LEVEL',
  'DB_CONNECT'
];


// Iterate to be sure all values set
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});


// Export variables of the process.env
export const {
  SERVER_PORT,
  NODE_ENV,
  BASE_URL,
  WINSTON_LOG_LEVEL,
  DB_CONNECT
} = process.env;



// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
