
// !!! THIS FILE IS NOT NECESSARY SINCE WE ARE USING SEQUELIZE
// !!! WILL KEEP THIS FILE HERE IF DECIDE NOT TO USE SEQUELIZE
// !!! TO USE IT YOU HAVE TO MOVE IT TO THE DATABASE FILE
// !!! THEN IMPORT IT IN SERVER.TS AND ADJUST START ETC...

// #region ===================== IMPORTS =======================================
import path from 'path';
import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Pool } from 'pg';
import {
  PG_DB_HOST,
  PG_DB_USERNAME,
  PG_DB_PASSWORD,
  PG_DB_NAME,
  PG_DB_PORT,
} from '../../src/config/env-module';
// #endregion ------------------------------------------------------------------


console.enter();





// #region ====================== START ========================================


// Create PostgreSQL connection pool
const POSTGRES = new Pool({
  host: PG_DB_HOST,
  user: PG_DB_USERNAME,
  password: PG_DB_PASSWORD,
  database: PG_DB_NAME,
  port: parseInt(PG_DB_PORT || '5432'),
});


// log when db succesfully established or throw error
POSTGRES.on('connect', () => {
  log.infor('Connected to the PostgreSQL database.');
});

POSTGRES.on('error', (err) => {
  log.error('Error with the PostgreSQL connection:', err);
});



export default POSTGRES;

// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
