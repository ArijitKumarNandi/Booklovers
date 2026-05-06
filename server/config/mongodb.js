import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI?.trim();

    if (!mongoUri) {
        console.log("Database connection failed: MONGO_URI is missing");
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 15000
        });
        console.log("✅ Database connected");
    } catch (error) {
        console.log("❌ Database connection failed:", error.message);
    }
};

export default connectDB;
