import { extendedConsole as console } from '../streams/consoles/customConsoles';
import { log } from '../utils/logger/logger-setup/logger-wrapper';
console.enter();

// !!! THIS FILE IS NOT MEANT TO BE RUN

  // TypeScript declaration files (.d.ts) are meant for type definitions only.
  // A .d.ts file should not be executed directly by Node.js.
  // The declaration file should only contain type declarations.


// #region ====================== START ========================================


// types for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PG_DB_HOST: string;
      PG_DB_PORT: string;
      PG_DB_USERNAME: string;
      PG_DB_PASSWORD: string;
      PG_DB_NAME: string;
      JWT_ACCESS_TOKEN_SECRET: string;
      JWT_REFRESH_TOKEN_SECRET: string;
      SERVER_PORT: string;
      BASE_URL: string;
      NODE_ENV: string;
      DB_CONNECT: string;
      WINSTON_LOG_LEVEL: string;
    }
  }
}

//------------------------------------------------------------------------------

// Error formatting interfaces
export interface StackFrame {
  function: string;
  location: string;
}

export interface ResponseDetails {
  name: string;
  title: string;
  status: number;
  message: string;
  time: string;
  errors?: Record<string, string>;
  cause?: unknown;
  trace: StackFrame[];
}

export interface RequestDetails {
  method: string;
  url: string;
  params: any;
  query: any;
  body: any;
  headers: any;
}

export interface TransactionReport {
  REQUEST: RequestDetails;
  RESPONSE: ResponseDetails;
}



//------------------------------------------------------------------------------

// Custom error types
export interface CustomError extends Error {
  statusCode?: number;
  details?: string;
}

export class NotFoundError extends Error implements CustomError {
  public statusCode = 404;
  public details: string;

  constructor(message: string, details: string) {
    super(message);
    this.details = details;
  }
}

export class BadRequestError extends Error implements CustomError {
  public statusCode = 400;
  public details: string;

  constructor(message: string, details: string) {
    super(message);
    this.details = details;
  }
}


//------------------------------------------------------------------------------

// Define a type for API responses
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: any;
}

// Example usage for a User API response
export interface UserApiResponse extends ApiResponse<UserAttributes> {}

//------------------------------------------------------------------------------


export interface TimeResult {
  now: Date;
}

export interface CSRFError extends Error {
  code?: string;
}

// Augment Express Request to include csrfToken method
declare global {
  namespace Express {
    interface Request {
      csrfToken(): string;
    }
  }
}

// No need for a custom interface if you're just using default Express functionality.
// Create a custom interface if you need to add custom methods, properties, or functionality to the Response object:

// import { Response as ExpressResponse } from 'express';

// // Extend the Express Response to include custom methods
// declare module 'express-serve-static-core' {
//   interface Response {
//     sendSuccess: (data: any, message?: string) => void;
//     sendError: (error: any, message?: string) => void;
//   }
// }


//------------------------------------------------------------------------------

// Augment the express module to add `context` to the Request interface
import { JwtPayload } from 'jsonwebtoken';
import * as Express from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;  // or number, depending on your DB
      username: string;
      email: string;
    };
    context?: JwtPayload;
  }
}



//------------------------------------------------------------------------------


// Define a type for the logging middleware
import { Request, Response, NextFunction } from 'express';

export type LoggingMiddleware = (req: Request, res: Response, next: NextFunction) => void;


//------------------------------------------------------------------------------

// Define the shape of your JWT payload
export interface JwtPayload {
  userId: string;  // or number, depending on your DB
  username: string;
  email: string;
  iat: number;     // issued at
  exp: number;     // expiration time
}


//------------------------------------------------------------------------------

import { JwtPayload } from 'jsonwebtoken';

interface CustomUser extends JwtPayload {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
}

interface SessionData {
  userId: string;
  sessionID: string;
  token: string;
  expires: string;
  lastActivity?: number;
  ipAddress?: string;
  userAgent?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomUser;
      session: Session & SessionData;  // Changed from sessionID to full SessionData
    }
  }
}

export {
  CustomUser,
  SessionData
}

//------------------------------------------------------------------------------


// Database Transaction Types
import { Transaction } from 'sequelize';

export type DatabaseTransaction = Transaction;

//------------------------------------------------------------------------------

// Define types for Sequelize models (adjust based on your actual models)
import { Model, DataTypes, Sequelize } from 'sequelize';

// Example for a User model
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


//------------------------------------------------------------------------------

// Type for a User record returned by Sequelize
export type UserRecord = UserAttributes & { createdAt: Date; updatedAt: Date };




// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

  // HOW TO EXPORT:

    // Use export keyword or declare global

        // The choice between global and exported declarations often depends on:

            // How widely the type will be used

            // Whether you want to control where and how the type is used

            // If you need to avoid naming conflicts

            // Your team's preferences for explicit vs implicit typing



  // HOW TO IMPORT:

    // import { Request, CSRFError, TimeResult } from './path/to/ts-definitions';

// #endregion ------------------------------------------------------------------
