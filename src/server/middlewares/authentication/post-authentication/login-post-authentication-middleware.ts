import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { BaseCustomError } from '../../custom-errors/base-custom-error';
// import { generateJWT, verifyJWT } from './jwt.service';
// import { JWT_ACCESS_TOKEN_SECRET } from '../../../../config/env-module';
// import { JwtPayload } from 'jsonwebtoken';
import { Session } from 'express-session';

console.enter();

// #region ====================== START ========================================


    // #region ============== SET AUTHENTICATION COOKIE ============================

        /**
         * Sets the JWT cookie after successful authentication
         * COMMENTED OUT - Not using JWT authentication in file-based app
         */
        export const setAuthenticationCookie: RequestHandler = async (req, res, next) => {
          // try {
          //   const payload: Omit<Express.Request['user'], 'hashedPassword' | 'iat' | 'exp'> = {
          //     id: req.body.id,
          //     username: req.body.username,
          //     email: req.body.email
          //   };

          //   const token = await generateJWT(payload, JWT_ACCESS_TOKEN_SECRET as string);

          //   res.cookie('token', token, {
          //     httpOnly: true,
          //     secure: process.env.NODE_ENV === 'production',
          //     sameSite: 'lax',
          //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
          //   });

          //   next();
          // } catch (error) {
          //   next(new BaseCustomError('Error setting token cookie', {
          //     status: 500,
          //     title: 'Authentication Error'
          //   }));
          // }
          next();
        };

    // #endregion ------------------------------------------------------------------




    // #region ================ RESTORE AUTHENTICATION =============================
        /**
         * This verifies the existing jwt token and sets the user on the req object
         * Should run on every request
         * COMMENTED OUT - Not using JWT authentication in file-based app
         */
        export const restoreAuthentication = async (
          req: Request,
          _res: Response,
          next: NextFunction
        ): Promise<void> => {
          // try {
          //   const { token } = req.cookies;
          //   if (!token) return next();

          //   const decoded = await verifyJWT(token, JWT_ACCESS_TOKEN_SECRET as string) as NonNullable<Express.Request['user']>;
          //   if (!decoded) return next();

          //   req.user = decoded;
          //   return next();
          // } catch (error) {
          //   // Don't throw error, just continue without user
          //   return next();
          // }
          return next();
        };
    // #endregion ------------------------------------------------------------------




    // #region =============== REQUIRE AUTHENTICATION ==============================
        /**
         * Middleware to check if user is authenticated by checking if a user exists
         * Can add this to a protected route
         */
        export const requireAuthentication = (
          req: Request,
          _res: Response,
          next: NextFunction
        ): void => {
          if (req.user) return next();

          const error = new BaseCustomError('Authentication required', {
            status: 401,
            title: 'Authentication required',
            errors: { message: 'Authentication required' }
          });

          return next(error);
        };
    // #endregion ------------------------------------------------------------------




    // #region ============ REFRESH AUTHENTICATION  ================================
        /**
         * This checks if the jwt token is nearing expiration and issues new one if needed
         * Will generate and set a new token if the current on is close to expiring
         * Typically used to extend the user's session without requiring re-login
         * COMMENTED OUT - Not using JWT authentication in file-based app
         */
        export const refreshAuthenticationToken = async (
          req: Request,
          res: Response,
          next: NextFunction
        ): Promise<void> => {
          // try {
          //   const { token } = req.cookies;
          //   if (!token) return next();

          //   const decoded = await verifyJWT(token, JWT_ACCESS_TOKEN_SECRET as string) as NonNullable<Express.Request['user']>;
          //   if (!decoded) return next();

          //   // Check if token is close to expiration (e.g., less than 1 hour remaining)
          //   const tokenExp = decoded.exp || 0;
          //   const hourFromNow = Math.floor(Date.now() / 1000) + 3600;

          //   if (tokenExp < hourFromNow) {
          //     // Instead of calling setAuthenticationCookie directly,
          //     // we should set the body data and call it as middleware
          //     req.body = {
          //       id: decoded.id,
          //       username: decoded.username,
          //       email: decoded.email
          //     };

          //     await setAuthenticationCookie(req, res, next);
          //   }

          //   next();
          // } catch (error) {
          //   next();
          // }
          next();
        };
    // #endregion ------------------------------------------------------------------




    // #region ================ CHECK SESSION EXPIRY ===============================
        // Define your custom session data interface
        interface CustomSessionData {
          lastActivity?: number;
          userId?: string;
          // Add other session properties you need
        }

        // Extend the Session interface
        declare module 'express-session' {
          interface Session extends CustomSessionData {}
        }

        /**
         * Checks user's inactivity time
         * Forces logout if user has been inactive too long
         * @param req
         * @param res
         * @param next
         */
        export const checkSessionExpiry = (
          req: Request,
          res: Response,
          next: NextFunction
        ): void => {
          try {
            const lastActivity = req.session?.lastActivity;
            const now = Date.now();
            const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

            // Forces logout after inactivity
            if (lastActivity && (now - lastActivity) > SESSION_TIMEOUT) {
              clearAuthenticationCookie(req, res, next);
              // Don't throw error after clearing cookie since clearAuthenticationCookie
              // already sends a response
              return;
            }

            if (req.session) {
              req.session.lastActivity = Date.now(); // this might need to be Date.now() instead of new Date()
            }

            next();
          } catch (error) {
            next(new BaseCustomError('Session check failed', {
              status: 500,
              title: 'Session Error',
              errors: { message: 'Failed to check session expiry' }
            }));
          }
        };

    // #endregion ------------------------------------------------------------------




    // #region =========== CLEAR AUTHENTICATION COOKIE =============================
        /**
         * Clears the Cookie on logout
         * @param res
         */
        export const clearAuthenticationCookie: RequestHandler = (
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          try {
            res.clearCookie('authToken', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });

            res.status(200).json({
              success: true,
              message: 'Logged out successfully'
            });
          } catch (error) {
            next(new BaseCustomError('Error clearing authentication', {
              status: 500,
              title: 'Authentication Error',
              errors: { message: 'Failed to clear authentication cookie' }
            }));
          }
        };


    // #endregion ------------------------------------------------------------------



// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
