// import mongoose from "mongoose";

// const connectDB = async ()=>{
//      try {
//         await mongoose.connect(process.env.url).then(()=> console.log("Welcome to Mongo DB!") )
//     } catch (error) {
//         console.error("Failed to connect to MongoDB:", error.name, error.message);
//         throw error; // Throw the error to stop the server if connection fails
//     }
// }

// export default connectDB;


import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "bookmyshow", // Default database name
      retryWrites: true, // Enable retryable writes
      w: "majority", // Write concern for majority
      appName: "BookMyShow", // Optional: for Atlas monitoring
    });
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error.name, error.message);
    throw error; // Throw error to halt server startup if connection fails
  }
};

export default connectDB;