import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();

export async function bootstrap() {

    const app = express();
    const PORT = process.env.PORT || 8000;

    //CORS SETUP
    const corsOrigin = process.env.CORS_ORIGIN;
    app.use(cors({
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));

    //BODY PARSERS
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //ROUTES
    app.get('/', (req, res) => {
        res.send('Hello from Expiry alert backend!!!!');
    })

    if (!PORT) {
        console.log('Port is not loaded from .env');
    }
    //server start listening
    app.listen(PORT, () => {
        console.log(`Expiry Alery server running on ${PORT}`)
    })
}

bootstrap().catch(console.error);




