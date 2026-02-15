import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

console.enter();

// #region ====================== START ========================================


// Process sequelize errors
interface ExtendedValidationError extends ValidationError {
  title: string;
  formattedErrors: { [key: string]: string };  // New property name
}


// Process sequelize errors
interface ExtendedValidationError extends ValidationError {
  title: string;
  formattedErrors: { [key: string]: string };
}

export const errorSequelizeValidator = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  log.enter("errorSequelizeValidator", log.brack);

  // Specifically check if it's a Sequelize ValidationError
  if (err instanceof ValidationError && err.name === 'SequelizeValidationError') {
    let errors: { [key: string]: string } = {};

    // Loop through each validation error
    for (let error of err.errors) {
      if (error.path) {
        errors[String(error.path)] = error.message;
      } else {
        errors['unknown'] = error.message;
      }
    }

    // Add title and formatted errors
    (err as ExtendedValidationError).title = 'Sequelize Validation error';
    (err as ExtendedValidationError).formattedErrors = errors;

    log.retrn("errorSequelizeValidator", log.kcarb);
    return next(err); // Pass the formatted error
  }

  log.retrn("errorSequelizeValidator", log.kcarb);
  return next(err); // If not a Sequelize validation error, pass through unchanged
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
