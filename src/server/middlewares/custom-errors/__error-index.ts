// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { BaseCustomError } from './base-custom-error';
import { _errorFormatter } from './_error-formatter';
import { errorSequelizeConstraint } from './error-sequelize-constraint';
import { errorSequelizeValidator } from './error-sequelize-validator';
import { error400_BadRequest } from './error400_BadRequest';
import { error401_Unauthorized } from './error401_Unauthorized';
import { error402_PaymentRequired } from './error402_PaymentRequired'
import { error403_Forbidden } from './error403_Forbidden';
import { error404_NotFound } from './error404_NotFound';
import { error408_RequestTimeout } from './error408_RequestTimeout';
import { error422_Validation } from './error422_Validation';
import { error500_InternalServer } from './error500_InternalServer';
import { error501_NotImplemented } from './error501_NotImplemented';
import { error502_BadGateway } from './error502_BadGateway';
import { error503_ServiceUnavailable } from './error503_ServiceUnavailable';
import { error504_GatewayTimeout } from './error504_GatewayTimeout';
import { error_globalCatchAll } from './error-global-catch-all';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== EXPORTS ========================================


// Export all error handlers
export {
    BaseCustomError,
    _errorFormatter,
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
    error504_GatewayTimeout,
    error_globalCatchAll
};

// Optional: Export default object with all handlers
export default {
    BaseCustomError,
    _errorFormatter,
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
    error504_GatewayTimeout,
    error_globalCatchAll
};

// #endregion ------------------------------------------------------------------

console.leave();
