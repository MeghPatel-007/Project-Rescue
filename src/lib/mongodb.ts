import mongoose from "mongoose";



export  async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Connected to MongoDB👍🏻");
    } catch (error) {
        console.log("Error connecting to MongoDB👎", error);
    }
}

