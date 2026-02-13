import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from '../custom-errors/base-custom-error';
import { verifyJWT } from '../authentication/post-authentication/jwt.service';
import { JWT_ACCESS_TOKEN_SECRET } from '../../../config/env-module';
import { CustomUser } from '@/types/ts-definitions';

// #region ====================== TYPES ========================================

// #endregion ------------------------------------------------------------------


// #region ====================== CONSTANTS ====================================
// Change to string[] to allow path comparison
const PUBLIC_ROUTES: string[] = [
    '/api/authentication/login',
    '/api/authentication/signup',
    '/',
    'test/database',
    'api/csrf/restore',
    '/health',
    '/api/docs'
];
// #endregion ------------------------------------------------------------------


// #region ====================== FUNCTIONS ====================================
const decodeToken = async (header: string | undefined): Promise<NonNullable<Express.Request['user']>> => {
    if (!header) {
        throw new BaseCustomError('Authorization header missing', {
            status: 401,
            title: 'Authorization Error',
            errors: { message: 'Missing authorization header' }
        });
    }

    const token = header.replace('Bearer ', '');

    try {
        const payload = await verifyJWT(token, JWT_ACCESS_TOKEN_SECRET as string);

        // Add explicit expiration check
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            throw new BaseCustomError('Token expired', {
                status: 401,
                title: 'Authorization Error',
                errors: { message: 'Token has expired' }
            });
        }

        return payload as NonNullable<Express.Request['user']>;
    } catch (error) {
        if (error instanceof BaseCustomError) throw error;
        throw new BaseCustomError('Invalid token', {
            status: 401,
            title: 'Authorization Error',
            errors: { message: 'Token is invalid' }
        });
    }
};


export const authorizationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { method, path } = req;

    // Now path comparison will work correctly
    if (method === 'OPTIONS' || PUBLIC_ROUTES.includes(path)) {
        return next();
    }

    try {
        const authorizationHeader =
            req.header('Authorization') || req.header('authorization');
        req.context = await decodeToken(authorizationHeader);
        next();
    } catch (error) {
        next(error);
    }
};
// #endregion ------------------------------------------------------------------
