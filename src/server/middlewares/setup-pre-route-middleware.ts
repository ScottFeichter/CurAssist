import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import { join } from 'path';
import express from 'express';
import { Request, Response, NextFunction, Application } from 'express';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { CSRFError } from '../../types/ts-definitions';
import { morganMiddleware } from '../../utils/logger/logger-middleware/logger-morganMiddleware';
import { checkSessionExpiry, refreshAuthenticationToken, restoreAuthentication } from './authentication/post-authentication/login-post-authentication-middleware'
import timeout from 'connect-timeout';
import { handleCSRFError } from './custom-errors/error-CSRF';

console.enter();

// #region ====================== START ========================================


export const setupPreRouteMiddleware = (SERVER: Application) => {
  log.enter("setupPreRouteMiddleware()", log.brack)



  // #region ================= VIEW ENGINE =====================================
    SERVER.set('views', join(__dirname, '../../views'));
    SERVER.set('view engine', 'html');
    SERVER.engine('html', require('ejs').renderFile);
  // #endregion ----------------------------------------------------------------



  // #region =============== TIMING MIDDLEWARE =================================
    // Sets startTime for a request
    SERVER.use((req, _res, next) => {
      (req as any).startTime = process.hrtime();
      next();
    });

    // Sets a 5-second timeout for all requests
    SERVER.use(timeout('5s'));

    // Checks if request has timed out before proceeding
    SERVER.use((req, res, next) => {
        if (!req.timedout) next();
    });
  // #endregion ----------------------------------------------------------------



  // #region =============== PARSING MIDDLEWARE ================================
    SERVER.use(cookieParser());
    SERVER.use(express.json({ limit: '10kb' }));
    SERVER.use(express.urlencoded({ extended: true, limit: '10kb' }));
    SERVER.use(compression());
  // #endregion ----------------------------------------------------------------



    // #region =============== LOGGING MIDDLEWARE ================================

    // Debug logging middleware first - turn on only if needed
    // SERVER.use((req, res, next) => {
    //   console.log(`Debug Log setup-pre-route...`, `Incoming request:`, {
    //     method: req.method,
    //     path: req.path,
    //     headers: req.headers,
    //     body: req.body,
    //     cookies: req.cookies
    //   });
    //   next();
    // });



    // Morgan for production logging
    SERVER.use(morganMiddleware);
  // #endregion ----------------------------------------------------------------



  // #region =============== SECURITY MIDDLEWARE ===============================
    // Cors
    SERVER.use(cors({
      origin: ['http://localhost:5555', 'http://127.0.0.1:5555', 'file://', 'http://localhost:5432'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'XSRF-Token'],
      credentials: true
    }));


    // Helmet helps set a variety of headers to better secure your app
    SERVER.use(
      helmet.crossOriginResourcePolicy({
          policy: "cross-origin"
      })
    );


    // Set the csrf and create req.csrfToken method
    const csrfProtection = csrf({
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : undefined,
      httpOnly: true
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
    });

    SERVER.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/sf')) return next();
      (csrfProtection as express.RequestHandler)(req, res, next);
    });
    SERVER.use(handleCSRFError);
  // #endregion ----------------------------------------------------------------



  // #region =============== RATE LIMITERS =====================================
    // General rate limiting (less strict)
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 300 // higher limit for general routes
    });
    SERVER.use(generalLimiter);
  // #endregion ----------------------------------------------------------------



  // #region =============== AUTHENTICATION MIDDLEWARE ================================
    // Add auth middleware here, after other security middleware
    SERVER.use(restoreAuthentication);
    SERVER.use(refreshAuthenticationToken);
    SERVER.use(checkSessionExpiry);
  // #endregion ----------------------------------------------------------------



  // #region =============== STATIC FILE MIDDLEWARE ============================
    // Serve frontend UI
    SERVER.use(express.static(join(__dirname, '../../public/frontend')));
  // #endregion ----------------------------------------------------------------



  // #region =============== ROUTE MIDDLEWARE ==================================

    // NOTE Using setupRoutes() in setup-routes.ts

  // #endregion ----------------------------------------------------------------




  log.retrn("setupPreRouteMiddleware()", log.kcarb);
};


// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// this pre route middleware is for application-wide middleware

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
