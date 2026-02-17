"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = exports.PORT = void 0;
// #region ===================== IMPORTS =======================================
const customConsoles_1 = require("../streams/consoles/customConsoles");
const dotenv_1 = __importDefault(require("dotenv"));
// #endregion ------------------------------------------------------------------
customConsoles_1.extendedConsole.enter();
// #region ===================== CONFIG ========================================
dotenv_1.default.config();
exports.PORT = process.env.PORT || '3456';
exports.NODE_ENV = process.env.NODE_ENV || 'development';
// #endregion ------------------------------------------------------------------
customConsoles_1.extendedConsole.leave();
