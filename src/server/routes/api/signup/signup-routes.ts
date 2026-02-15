// import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
// import { Router, Request, Response, NextFunction } from 'express';
// import { signupMiddleware } from '../../../middlewares/authentication/authentication-middleware';
// import { BaseCustomError } from '../../../middlewares/custom-errors/base-custom-error';
// import { clearAuthenticationCookie } from '../../../middlewares/authentication/post-authentication/login-post-authentication-middleware';
// import DemoUser from '../../../../database/models/DemoUser';

// console.enter();
/*
const signupRouter = Router();

signupRouter.post(
  '/api/signup',
  signupMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Initialize session
      req.session.lastActivity = Date.now();

      // User is already created and attached to req.user by createNewUser middleware
      const userResponse = {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email
      };

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: userResponse
      });

    } catch (error) {
      // If something fails after user creation, we should cleanup
      if (req.user?.id) {
        try {
          // Use Sequelize destroy method instead of raw SQL
          await DemoUser.destroy({
            where: {
              id: req.user.id
            }
          });
        } catch (cleanupError) {
          // Log cleanup error but throw original error
          console.error('Cleanup failed:', cleanupError);
        }
      }

      // Clear any partially set cookies
      clearAuthenticationCookie(req, res, next);

      next(new BaseCustomError('Registration failed', {
        status: 500,
        title: 'Registration Error',
        cause: error
      }));
    }
  }
);

export default signupRouter;

// console.leave();
*/

// #region ====================== NOTES ========================================
// Commented out - requires Sequelize/DemoUser model which doesn't exist yet

export {};
