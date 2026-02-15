import express from 'express';
import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import bucketsRouter from './buckets/buckets-routes';
// import demoUsersRouter from './demousers/demoUsers-routes';
// import loginRouter from './login/login-routes';
// import logoutRouter from './login/logout-routes';
// import signupRouter from './signup/signup-routes';

console.enter();

// #region ====================== START ========================================

const apiRouter = express.Router();

// Mount routes
apiRouter.use('/buckets', bucketsRouter);
// apiRouter.use('/signup', signupRouter); // Commented out - requires DemoUser
// apiRouter.use('/login', loginRouter); // Commented out - requires authentication middleware
// apiRouter.use('/logout', logoutRouter); // Commented out - requires authentication middleware
// apiRouter.use('/demousers', demoUsersRouter); // Commented out - requires DemoUser

// You can add other route modules here as needed
// apiRouter.use('/other-resource', otherResourceRouter);


export default apiRouter;

// #endregion ------------------------------------------------------------------

console.leave();
