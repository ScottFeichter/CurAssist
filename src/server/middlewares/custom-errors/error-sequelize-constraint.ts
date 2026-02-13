import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } from 'sequelize';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const errorSequelizeConstraint = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  log.enter("errorSequelizeConstraint", log.brack);

  // Check for various constraint errors
  if (
    err instanceof UniqueConstraintError ||
    err instanceof ForeignKeyConstraintError ||
    (err instanceof DatabaseError && err.message.includes('constraint'))
  ) {
    let title = 'Database Constraint Error';
    let status = 409; // Conflict status code
    let errors: Record<string, string> = {};

    if (err instanceof UniqueConstraintError) {
      title = 'Unique Constraint Error';
      err.errors.forEach(error => {
        if (error.path) {
          errors[error.path] = `${error.path} must be unique`;
        } else {
          errors['value'] = error.message;
        }
      });
    }
    else if (err instanceof ForeignKeyConstraintError) {
      title = 'Foreign Key Constraint Error';
      const field = err.fields ? err.fields[0] : 'unknown';
      errors[field] = `Referenced ${field} does not exist`;
    }
    else {
      errors['constraint'] = err.message;
    }

    // Create formatted error
    const constraintError = new BaseCustomError(title, {
      title,
      status,
      errors,
      cause: err
    });

    // Add additional context if needed
    (constraintError as any).constraint = err.name;
    (constraintError as any).table = (err as any).table;
    (constraintError as any).fields = (err as any).fields;

    log.retrn("errorSequelizeConstraint", log.kcarb);
    return next(constraintError);
  }

  log.retrn("errorSequelizeConstraint", log.kcarb);
  return next(err); // If not a constraint error, pass through unchanged
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================
/*
  Sequelize Constraint Errors:
  - UniqueConstraintError: Violation of unique constraint (duplicate values)
  - ForeignKeyConstraintError: Referenced record doesn't exist
  - Other constraint violations (check constraints, etc.)

  Common HTTP Status Codes:
  - 409 Conflict: For unique constraint violations
  - 422 Unprocessable Entity: For foreign key violations
  - 400 Bad Request: For other constraint violations
*/
// #endregion ------------------------------------------------------------------
