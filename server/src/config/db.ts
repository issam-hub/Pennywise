import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongodbURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/pennywise";

    await mongoose.connect(mongodbURI);
    console.log("mongoDB connected successfully");
  } catch (err) {
    console.error("mongoDB connection error: ", err);
    process.exit(1);
  }
};

export default connectDB;
