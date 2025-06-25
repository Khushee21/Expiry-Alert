import { Router } from 'express';
import {
    signup,
    login,
    RequestOTPHandler,
    VerifyOtpHandler
} from '../controllers/User.controllers.js';

const router = Router();

router.post('/request-otp', RequestOTPHandler);
router.post('/signup', signup);
router.post('/login', login);


export default router;