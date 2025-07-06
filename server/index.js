import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './utils/db.js';
import UserRoute from './routes/All.routes.js';
import { runDailyNotificationJob } from './controllers/notification.controllers.js';

const app = express();
const PORT = process.env.PORT || 8000;

const bootstrap = async () => {
    try {
        await connectDB();

        // CORS setup
        app.use(cors({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Body parsers
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Routes
        app.get('/', (req, res) => {
            res.send('👋 Hello from Expiry Alert backend!');
        });

        // Start cron job
        runDailyNotificationJob();

        // API routes
        app.use('/auth', UserRoute);

        // Start server
        app.listen(PORT, () => {
            console.log(`✅ Expiry Alert server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
    }
};

bootstrap();
