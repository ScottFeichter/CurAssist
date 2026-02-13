"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./utils/logger/logger"));
const server_1 = require("./server/routes/server");
logger_1.default.infor('=== CurAssist Starting ===');
logger_1.default.infor(`Environment: ${process.env.NODE_ENV || 'development'}`);
(0, server_1.start)(server_1.SERVER);
