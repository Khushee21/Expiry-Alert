import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./utils/db.js";
import UserRoute from "./routes/All.routes.js";

export async function bootstrap() {
    const app = express();
    const PORT = process.env.PORT || 8000;

    await connectDB();

    // CORS setup
    const corsOrigin = process.env.CORS_ORIGIN || 'http://192.168.9.45:19000';
    app.use(cors({
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));

    // Body parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.get('/', (req, res) => {
        res.send('Hello from Expiry Alert backend!');
    });

    app.use('/auth', UserRoute);

    if (!PORT) {
        console.log('⚠️ Port is not loaded from .env');
    }

    // Start server
    app.listen(PORT, () => {
        console.log(`✅ Expiry Alert server running on port ${PORT}`);
    });
}

bootstrap().catch(console.error);
