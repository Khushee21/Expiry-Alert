const upload = multer({ dest: 'uploads/' });
import { Router } from 'express';
import {
    signup,
    login,
    RequestOTPHandler,
    VerifyOtpHandler,
    logout,
    refreshTokenHandler,
} from '../controllers/User.controllers.js';
import { authenticateUser } from '../middleware/authMiddleware.js'
import multer from 'multer';


//ADD PRODUCT
import {
    AddViaOCR,
    AddManually,
    getAllProducts
} from '../controllers/addItem.controllers.js';

//NOTIFICATIONS
import { getNotifications } from '../controllers/notification.controllers.js';

const router = Router();

//AUTH ROUTES
router.post('/request-otp', RequestOTPHandler);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshTokenHandler);

//ADD PRODUCR ROUTES
router.post('/addItem/ocr', authenticateUser, upload.single('image'), AddViaOCR);
router.post('/addItem/manual', authenticateUser, AddManually);
router.get('/allItems', authenticateUser, getAllProducts);

//ADD NOTIFICATION ROUTES

router.get('/notifications', authenticateUser, getNotifications);


export default router;