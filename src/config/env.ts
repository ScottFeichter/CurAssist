// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../streams/consoles/customConsoles';
import dotenv from 'dotenv';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONFIG ========================================

dotenv.config();

export const PORT = process.env.PORT || '3456';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// #endregion ------------------------------------------------------------------

console.leave();
