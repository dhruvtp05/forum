import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri: string = process.env.MONGO_URI || "";
console.log("MongoDB URI:", uri);

if (!uri) {
  console.error("MongoDB URI is not set in the environment variables.");
  process.exit(1);
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectToDatabase;
