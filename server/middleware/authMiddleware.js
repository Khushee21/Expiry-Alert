import { verifyAccessToken } from "../utils/jwt.js";
import { sendError, sendSuccess } from "../utils/apiResponses.js";

export const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return sendError(res, 'Unauthorized: Token missing', 401);
    }

    const token = authHeader.split(' ')[1];  //[Bearer , access token]
    try {
        const decode = verifyAccessToken(token);
        if (!decode) {
            return sendError(res, "Token verification error",);
        }
        req.user = {
            id: decode.userId,
            email: decode.email, //optional
        };
        next();
    }
    catch (err) {
        return sendError(res, "Invalid token" || err, 401);
    }

};