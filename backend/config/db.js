import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const connectDB = async ({ retries = 5, delay = 5000 } = {}) => {
    // Use a loop with retries to avoid immediate process exit on transient DNS/network errors
    let attempt = 0;
    const uri = process.env.DATABASE_URL;
    if (!uri) throw new Error('DATABASE_URL is not defined in environment');

    while (attempt <= retries) {
        try {
            // Mongoose v6+ uses sensible defaults; include a reasonable server selection timeout
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
            console.log('Connected to MongoDB');
            return;
        } catch (error) {
            attempt += 1;
            const isLast = attempt > retries;
            console.error(`MongoDB connection attempt ${attempt} failed:`,
                error?.message || error);

            if (error && error.code === 'ETIMEOUT' && error.syscall === 'queryTxt') {
                console.error('DNS TXT lookup timed out when resolving the SRV connection string.');
                console.error('If you are using `mongodb+srv://` ensure DNS is reachable, or use a standard `mongodb://` URI.');
            }

            if (isLast) {
                console.error('All MongoDB connection attempts failed.');
                throw error;
            }

            console.log(`Retrying MongoDB connection in ${delay}ms...`);
            await wait(delay);
            // exponential backoff
            delay *= 1.5;
        }
    }
};

export default connectDB;