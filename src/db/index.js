import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("---- Connected to MongoDB ----");
    } catch (error) {
        console.error("ERROR - Not connected to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;