"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.SERVER = void 0;
// #region ===================== IMPORTS =======================================
const customConsoles_1 = require("../streams/consoles/customConsoles");
const logger_wrapper_1 = require("../utils/logger/logger-setup/logger-wrapper");
const express_1 = __importDefault(require("express"));
const setup_pre_route_middleware_1 = require("./middlewares/setup-pre-route-middleware");
const setup_routes_1 = require("./routes/setup-routes");
const setup_post_route_middleware_1 = require("./middlewares/setup-post-route-middleware");
// import SEQUELIZE from '../../database/sequelize';
const env_module_1 = require("../config/env-module");
const atlas_1 = require("../database/atlas");
const cors_1 = __importDefault(require("cors"));
// #endregion ------------------------------------------------------------------
customConsoles_1.extendedConsole.enter();
// #region ====================== START ========================================
logger_wrapper_1.log.infor(`NODE_ENV at runtime from server.ts: ${process.env.NODE_ENV}`);
/**
 * The Express application instance.
 * Exported so it can be passed into start() from entry.ts.
 */
exports.SERVER = (0, express_1.default)();
/**
 * Starts the Express server.
 * Connects to MongoDB Atlas before binding to the port —
 * the server will not start if the DB connection fails.
 * @param SERVER - The Express application instance
 */
const start = async (SERVER) => {
    logger_wrapper_1.log.enter("start()", logger_wrapper_1.log.brack);
    try {
        // Middleware
        SERVER.use((0, cors_1.default)());
        SERVER.use(express_1.default.json({ limit: '50mb' }));
        // Add setup middleware and set up routes
        (0, setup_pre_route_middleware_1.setupPreRouteMiddleware)(SERVER);
        (0, setup_routes_1.setupRoutes)(SERVER);
        (0, setup_post_route_middleware_1.setupPostRouteMiddleware)(SERVER);
        // Connect to MongoDB Atlas — server will not start if connection fails
        await (0, atlas_1.connectToAtlas)();
        SERVER.listen(env_module_1.SERVER_PORT, () => {
            logger_wrapper_1.log.blank();
            customConsoles_1.extendedConsole.infor('To prevent terminal line wrapping run: tput rmam');
            customConsoles_1.extendedConsole.infor('To restore terminal line wrapping run: tput smam');
            logger_wrapper_1.log.blank();
            customConsoles_1.extendedConsole.infor(`✅ Server is running at \x1b[36mhttp://localhost:${env_module_1.SERVER_PORT}\x1b[0m`);
            logger_wrapper_1.log.blank();
        });
    }
    catch (error) {
        logger_wrapper_1.log.blank();
        customConsoles_1.extendedConsole.error('❌ Failed to start server:', error);
        logger_wrapper_1.log.blank();
        process.exit(1);
    }
    return logger_wrapper_1.log.retrn("start()", logger_wrapper_1.log.kcarb);
};
exports.start = start;
// #endregion ------------------------------------------------------------------
customConsoles_1.extendedConsole.leave();
// #region ====================== NOTES ========================================
// #endregion ------------------------------------------------------------------
