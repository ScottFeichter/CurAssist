// #region ===================== IMPORTS =======================================
import mongoose from 'mongoose';
import { extendedConsole as console } from '../streams/consoles/customConsoles';
import { log } from '../utils/logger/logger-setup/logger-wrapper';
import { DB_CONNECT } from '../config/env-module';
// #endregion ------------------------------------------------------------------


console.enter();


// #region ====================== START ========================================


/**
 * Connects to MongoDB Atlas using the DB_CONNECT environment variable.
 * Called in server.ts before SERVER.listen() — the server will not start
 * if this connection fails. Exits the process with code 1 on failure.
 */
export const connectToAtlas = async (): Promise<void> => {
  log.enter('connectToAtlas()', log.brack);

  try {

    if (!DB_CONNECT) {
      throw new Error('DB_CONNECT environment variable is not set');
    }

    await mongoose.connect(DB_CONNECT);

    log.blank();
    console.infor(`✅ Connected to MongoDB Atlas — db: ${mongoose.connection.name}`);
    log.blank();

  } catch (error) {
    log.blank();
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    log.warni(`⚠️  Database connection failed — app will not start: ${error instanceof Error ? error.message : error}`);
    log.blank();
    process.exit(1);
  }

  return log.retrn('connectToAtlas()', log.kcarb);
};


/**
 * Disconnects from MongoDB Atlas.
 * Available for graceful shutdown scenarios.
 */
export const disconnectFromAtlas = async (): Promise<void> => {
  log.enter('disconnectFromAtlas()', log.brack);

  try {

    await mongoose.disconnect();
    log.infor('MongoDB Atlas connection closed');

  } catch (error) {
    console.error('Error disconnecting from MongoDB Atlas:', error);
  }

  return log.retrn('disconnectFromAtlas()', log.kcarb);
};


// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// connectToAtlas() is called in server.ts before SERVER.listen()
// Server will not start if the DB connection fails — process.exit(1) on error
// disconnectFromAtlas() is available for graceful shutdown

// #endregion ------------------------------------------------------------------
