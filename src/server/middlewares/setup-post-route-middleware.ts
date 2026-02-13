import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction, Application } from 'express';
import { BaseCustomError,
  _errorFormatter,
  error_globalCatchAll,
  errorSequelizeConstraint,
  errorSequelizeValidator,
  error400_BadRequest,
  error401_Unauthorized,
  error402_PaymentRequired,
  error403_Forbidden,
  error404_NotFound,
  error408_RequestTimeout,
  error422_Validation,
  error500_InternalServer,
  error501_NotImplemented,
  error502_BadGateway,
  error503_ServiceUnavailable,
  error504_GatewayTimeout } from './custom-errors/__error-index';


console.enter();

// #region ====================== START ========================================


export const setupPostRouteMiddleware = (SERVER: Application) => {
  log.enter("setupPostRouteMiddleware()", log.brack)


  // 1. Errors from Sequelize
  SERVER.use(errorSequelizeConstraint);    // Database constraint violations (unique, foreign key, etc.)
  SERVER.use(errorSequelizeValidator);     // Database/schema validation errors (data type, length, etc.)


  // 2. Client errors (4xx series)
  SERVER.use(error400_BadRequest);         // Malformed requests
  SERVER.use(error401_Unauthorized);       // Authentication issues
  SERVER.use(error402_PaymentRequired);    // Payment issues
  SERVER.use(error403_Forbidden);          // Authorization issues
  SERVER.use(error408_RequestTimeout);     // Request timeout
  SERVER.use(error422_Validation);         // Data validation issues


  // 3. Server errors (5xx series)
  SERVER.use(error500_InternalServer);     // Generic server errors
  SERVER.use(error501_NotImplemented);     // Unimplemented features
  SERVER.use(error502_BadGateway);         // Gateway issues
  SERVER.use(error503_ServiceUnavailable); // Service availability
  SERVER.use(error504_GatewayTimeout);     // Gateway timeout


  // 4. These should always be last
  SERVER.use(error404_NotFound);           // Must be after all routes
  SERVER.use(error_globalCatchAll);        // Catch unexpected errors and non BaseCustomErrors
  SERVER.use(_errorFormatter);             // Must be the very last middleware

  log.retrn("setupPostRouteMiddleware()", log.kcarb)
};


// #endregion ----------------------------------------------------------------

console.leave();


// #region ====================== NOTES ========================================

// This post route middleware is for application-wide middleware

// Order of global middleware is important:

  // 0. View (for error formatting in the browser)
  // 1. Timing
  // 2. Parsing (cookie-parser, body-parser, compression)
  // 3. Logging
  // 4. Security (rate limit, cors, helmet, csrf)
  // 5. Authentication w Rate Limiting
  // 6. Static
  // 7. Routes
  // 8. Sequelize Validation Error handler
  // 9. Client Error handlers
  // 10. Server Error handlers
  // 11. 404 handler
  // 12. Catch All
  // 13. Error formatter

// #endregion ------------------------------------------------------------------
