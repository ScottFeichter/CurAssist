// import { extendedConsole as console } from '@/streams/consoles/customConsoles';
// import { log } from '@/utils/logger/logger-setup/logger-wrapper';
// import express, { Request, Response, NextFunction, Application } from 'express';
// import DemoUser from '../../../../database/models/DemoUser';
// import bcrypt  from 'bcrypt'

// console.enter();


// #region ====================== START ========================================
/*
const demoUsersRouter = express.Router();

  // Get all demousers
  demoUsersRouter.get('/', async (req: Request, res: Response) => {
    try {
      const demousers = await DemoUser.findAll();
      res.json(demousers);
    } catch (error) {
      log.error(error);
      res.status(500).json({ error: 'Failed to fetch demousers' });
    }
  });

  // Post a new demouser
  interface CreateDemoUserAttributes {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    hashedPassword: Buffer;
  }

  demoUsersRouter.post('/', async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, username, password } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const demouser = await DemoUser.create({
        firstName,
        lastName,
        email,
        username,
        hashedPassword: Buffer.from(hashedPassword)
      } as CreateDemoUserAttributes);

      // Return user without hashedPassword
      const { hashedPassword: _, ...userWithoutPassword } = demouser.toJSON();
      res.json(userWithoutPassword);
    } catch (error) {
      log.error(error);
      res.status(500).json({ error: 'Failed to create demouser' });
    }
  });

  // Get a demouser by id
  demoUsersRouter.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const demouser = await DemoUser.findOne({
        where: { id: id }
      });

      if (!demouser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(demouser);
    } catch (error) {
      log.error(error);
      res.status(500).json({ error: 'Failed to fetch demouser' });
    }
  });

  // Update a demouser by id
  demoUsersRouter.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, username } = req.body;

      const demouser = await DemoUser.findByPk(id);

      if (!demouser) {
        return res.status(404).json({ error: 'User not found' });
      }

      await demouser.update({
        firstName: firstName || demouser.firstName,
        lastName: lastName || demouser.lastName,
        email: email || demouser.email,
        username: username || demouser.username
      });

      res.json(demouser);
    } catch (error) {
      log.error(error);
      res.status(500).json({ error: 'Failed to update demouser' });
    }
  });

  // Delete a demouser by id
  demoUsersRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const demouser = await DemoUser.findByPk(id);

      if (!demouser) {
        return res.status(404).json({ error: 'User not found' });
      }

      await demouser.destroy();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      log.error(error);
      res.status(500).json({ error: 'Failed to delete demouser' });
    }
  });

export default demoUsersRouter;
*/

// #endregion ------------------------------------------------------------------


// console.leave();


// #region ====================== NOTES ========================================
// Commented out - requires Sequelize/DemoUser model which doesn't exist yet

export {};

// #endregion ------------------------------------------------------------------
