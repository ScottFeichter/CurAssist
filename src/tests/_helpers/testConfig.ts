// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ====================== START ========================================

export const testConfig = {
  database: {
    dialect: process.env.TEST_DB_DIALECT || 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password',
    database: process.env.TEST_DB_NAME || 'your_app_test',
    logging: false // Disable logging during tests
  }
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
