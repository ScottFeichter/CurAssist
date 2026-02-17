// #region ===================== IMPORTS =======================================
// import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
// import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
// import { Request, Response, NextFunction } from 'express';
// import { BaseCustomError } from '../../custom-errors/base-custom-error';
// import loginRouter from '../../../routes/api/login/login-routes';
// import logoutRouter from '../../../routes/api/login/logout-routes';
// import {
//   checkUserExists,
//   verifyPassword,
// } from '../pre-authentication/login-pre-authentication-middleware';
// #endregion ------------------------------------------------------------------

// Note: This file is commented out, so no console.enter/leave

// #region ===================== MIDDLEWARE ====================================

// const MAX_SESSIONS_PER_USER = 2; // Configure max allowed sessions

// export const manageUserSessions = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user?.id) {
//       return next();
//     }

//     const userId = req.user.id;
//     const sessionId = req.sessionID;
//     const ipAddress = req.ip;
//     const userAgent = req.headers['user-agent'];

//     // Check number of active sessions
//     const activeSessions = await pool.query(
//       `SELECT COUNT(*)
//        FROM user_sessions
//        WHERE user_id = $1`,
//       [userId]
//     );

//     const sessionCount = parseInt(activeSessions.rows[0].count);

//     if (sessionCount >= MAX_SESSIONS_PER_USER) {
//       // Optional: Remove oldest session
//       await pool.query(
//         `DELETE FROM user_sessions
//          WHERE user_id = $1
//          AND created_at = (
//            SELECT MIN(created_at)
//            FROM user_sessions
//            WHERE user_id = $1
//          )`,
//         [userId]
//       );
//     }

//     // Add new session
//     await pool.query(
//       `INSERT INTO user_sessions
//        (user_id, session_id, ip_address, user_agent)
//        VALUES ($1, $2, $3, $4)`,
//       [userId, sessionId, ipAddress, userAgent]
//     );

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Middleware to update session last activity
// export const updateSessionActivity = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (req.sessionID && req.user?.id) {
//       await pool.query(
//         `UPDATE user_sessions
//          SET last_activity = CURRENT_TIMESTAMP
//          WHERE session_id = $1`,
//         [req.sessionID]
//       );
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Cleanup expired sessions
// export const removeSession = async (sessionId: string): Promise<void> => {
//   try {
//     await pool.query(
//       'DELETE FROM user_sessions WHERE session_id = $1',
//       [sessionId]
//     );
//   } catch (error) {
//     console.error('Error removing session:', error);
//   }
// };

// // Use in your login route
// loginRouter.post(
//   '/api/login',
//   validateAuthenticationRequest,
//   checkUserExists,
//   verifyPassword,
//   manageUserSessions, // Add this middleware
//   async (req: Request, res: Response, next: NextFunction) => {
//     // ... rest of your login handler
//   }
// );

// // Add session cleanup on logout
// logoutRouter.post('/api/logout', async (req: Request, res: Response) => {
//   try {
//     await removeSession(req.sessionID);
//     // ... rest of logout logic
//     res.status(200).json({ message: 'Logged out successfully' });
//   } catch (error) {
//     // ... error handling
//   }
// });

// // Optional: Periodic cleanup of old sessions
// const cleanupOldSessions = async () => {
//   try {
//     await pool.query(
//       `DELETE FROM user_sessions
//        WHERE last_activity < NOW() - INTERVAL '30 minutes'`
//     );
//   } catch (error) {
//     console.error('Error cleaning up sessions:', error);
//   }
// };

// // Run cleanup every hour
// setInterval(cleanupOldSessions, 60 * 60 * 1000);

// #endregion ------------------------------------------------------------------
