// /// <reference types="jest" />
// import jwt from 'jsonwebtoken';
// import { generateJWT, verifyJWT } from '../../server/middlewares/authenticaiton/post-authentication/jwt.service';

// jest.mock('jsonwebtoken', () => ({
//     sign: jest.fn(),
//     verify: jest.fn(),
// }));

// describe('JWT Service', () => {
//     const secretKey = 'test_secret';
//     const payload = { userId: '123' };

//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     test('generateJWT should return a valid token', async () => {
//         (jwt.sign as jest.Mock).mockReturnValue('mockedToken');

//         const token = await generateJWT(payload, secretKey);

//         expect(jwt.sign).toHaveBeenCalledWith(payload, secretKey);
//         expect(token).toBe('Bearer mockedToken');
//     });

//     test('verifyJWT should return the correct payload when token is valid', async () => {
//         (jwt.verify as jest.Mock).mockReturnValue(payload);

//         const result = await verifyJWT('Bearer validToken', secretKey);

//         expect(jwt.verify).toHaveBeenCalledWith('validToken', secretKey);
//         expect(result).toEqual(payload);
//     });

//     test('verifyJWT should throw an error if token is invalid', async () => {
//         (jwt.verify as jest.Mock).mockImplementation(() => {
//             throw new Error('Invalid token');
//         });

//         await expect(verifyJWT('Bearer invalidToken', secretKey)).rejects.toThrow(
//             'Invalid token'
//         );
//     });
// });
