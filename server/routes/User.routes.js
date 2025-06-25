import { Router } from 'express';
import {
    signup,
    login,
    RequestOTPHandler,
    VerifyOtpHandler,
    logout,
    refreshTokenHandler,
} from '../controllers/User.controllers.js';

const router = Router();

router.post('/request-otp', RequestOTPHandler);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshTokenHandler);


export default router;