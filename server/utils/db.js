import mongoose from mongoose;
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URL;

if (!url) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
}

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(uri);
        console.log('✅ MongoDB connected');
    }
    catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}

export default connectDB;