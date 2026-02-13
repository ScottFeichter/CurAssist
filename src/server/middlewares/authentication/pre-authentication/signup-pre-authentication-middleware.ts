// import { extendedConsole as console } from '@/streams/consoles/customConsoles';
// import { RequestHandler } from "express-serve-static-core";
// import { BaseCustomError } from "../../custom-errors/base-custom-error";
// import bcrypt from 'bcrypt';
// import DemoUser from '@/database/models/DemoUser';

// console.enter();

// #region ====================== START ========================================
/*
    // #region ================ VALIDATE SIGNUP DATA ===============================
        export const validateSignupData: RequestHandler = async (req, res, next) => {
          try {
            const { firstName, lastName, username, email, password, confirmPassword } = req.body;

            // Validate all required fields exist
            const requiredFields = { firstName, lastName, username, email, password, confirmPassword };
            const missingFields = Object.entries(requiredFields)
              .filter(([_, value]) => !value)
              .map(([field]) => field);

            if (missingFields.length > 0) {
              throw new BaseCustomError('Missing required fields', {
                status: 400,
                title: 'Validation Error',
                errors: {
                  message: `Missing fields: ${missingFields.join(', ')}`
                }
              });
            }

            // Validate name formats (no numbers or special characters)
            const nameRegex = /^[a-zA-Z\s-']+$/;
            if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
              throw new BaseCustomError('Invalid name format', {
                status: 400,
                title: 'Validation Error',
                errors: {
                  message: 'Names should only contain letters, spaces, hyphens, or apostrophes'
                }
              });
            }

            // Validate username format (alphanumeric and underscores, 3-30 characters)
            const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
            if (!usernameRegex.test(username)) {
              throw new BaseCustomError('Invalid username format', {
                status: 400,
                title: 'Validation Error',
                errors: {
                  message: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores'
                }
              });
            }

            // Validate password match
            if (password !== confirmPassword) {
              throw new BaseCustomError('Passwords do not match', {
                status: 400,
                title: 'Validation Error',
                errors: {
                  message: 'Password and confirmation password must match'
                }
              });
            }

            // Validate password strength
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
              throw new BaseCustomError('Password too weak', {
                status: 400,
                title: 'Validation Error',
                errors: {
                  message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                }
              });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              throw new BaseCustomError('Invalid email format', {
                status: 400,
                title: 'Validation Error',
                errors: {
                  message: 'Please provide a valid email address'
                }
              });
            }

            next();
          } catch (error) {
            next(error);
          }
        };
    // #endregion ------------------------------------------------------------------



    // #region ================ CHECK NO USER EXISTS ===============================
        export const checkUserNotExists: RequestHandler = async (req, res, next) => {
          try {
            const { username, email } = req.body;

            // Check username and email separately for more specific error messages
            const existingUsername = await DemoUser.findOne({
              where: { username }
            });

            const existingEmail = await DemoUser.findOne({
              where: { email }
            });

            if (existingUsername && existingEmail) {
              throw new BaseCustomError('DemoUser already exists', {
                status: 409,
                title: 'Registration Error',
                errors: {
                  message: 'Both username and email are already taken'
                }
              });
            }

            if (existingUsername) {
              throw new BaseCustomError('Username taken', {
                status: 409,
                title: 'Registration Error',
                errors: {
                  message: 'This username is already taken'
                }
              });
            }

            if (existingEmail) {
              throw new BaseCustomError('Email taken', {
                status: 409,
                title: 'Registration Error',
                errors: {
                  message: 'This email is already registered'
                }
              });
            }

            next();
          } catch (error) {
            next(error);
          }
        };
    // #endregion ------------------------------------------------------------------


    // #region ================== CREATE NEW USER  =================================
        export const createNewUser: RequestHandler = async (req, res, next) => {
          try {
            const { firstName, lastName, username, email, password } = req.body;

            // Hash password and convert to Buffer
            const hashedPassword = Buffer.from(await bcrypt.hash(password, 10));

            // Create new user using Sequelize
            await DemoUser.create({
              firstName,
              lastName,
              username,
              email,
              hashedPassword
            });

            next();
          } catch (error) {
            next(error);
          }
        };
    // #endregion ------------------------------------------------------------------




    // #region ================ VERIFY USER CREATION  ==============================
        export const verifyUserCreation: RequestHandler = async (req, res, next) => {
          try {
            const { username, email } = req.body;

            // Check if user was successfully created (async operation)
            const newUser = await DemoUser.findOne({
              where: {
                username,
                email
              },
              attributes: ['id', 'firstName', 'lastName', 'username', 'email']
            });

            if (!newUser) {
              throw new BaseCustomError('User creation failed', {
                status: 500,
                title: 'Registration Error',
                errors: {
                  message: 'Failed to create user account'
                }
              });
            }

            // If we get here, user was successfully created
            res.status(201).json({
              message: 'User successfully created',
              user: newUser
            });

          } catch (error) {
            next(error);
          }
        };
    // #endregion ------------------------------------------------------------------


// #endregion ------------------------------------------------------------------


// console.leave();
*/

// #region ====================== NOTES ========================================
// Commented out - requires Sequelize/DemoUser model which doesn't exist yet

export {};

// #endregion ------------------------------------------------------------------
