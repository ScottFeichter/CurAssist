import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import jwt from 'jsonwebtoken';

console.enter();

// #region ====================== START ========================================

    export const generateJWT = async (payload: any, secretKey: string) => {
        try {
            const token = `Bearer ${jwt.sign(payload, secretKey)}`;
            return token;
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    export const verifyJWT = async (
        token: string,
        secretKey: string,
    ): Promise<jwt.JwtPayload> => {
        try {
            const cleanedToken = token.replace('Bearer ', '');
            const data = jwt.verify(cleanedToken, secretKey);

            if (typeof data === 'string') {
                throw new Error('Invalid token payload');
            }

            return data as jwt.JwtPayload;
        } catch (error: any) {
            throw new Error(error.message);
        }
    };


// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
