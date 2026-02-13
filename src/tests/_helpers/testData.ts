import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';

console.enter();

// #region ====================== START ========================================

export const mockUsers = [
  {
    username: 'testuser1',
    password: 'password123',
    email: 'test1@example.com'
  },
  {
    username: 'testuser2',
    password: 'password456',
    email: 'test2@example.com'
  }
];

export const mockLoginData = {
  validCredentials: {
    username: 'testuser1',
    password: 'password123'
  },
  invalidCredentials: {
    username: 'testuser1',
    password: 'wrongpassword'
  }
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
