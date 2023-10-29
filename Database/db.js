import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;

const connectdatabase = async () => {
    try {
        await mongoose.set('strictQuery', true);
        await mongoose.connect(url)
        console.log('connected to database successfully')
    }
    catch (err) {
        console.log('error while connecting to database ', err.message)
    }
}

export default connectdatabase;