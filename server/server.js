import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/mongoDbConn.js';
import cors from 'cors';
import authRouter from './App/routes/user.js';
import bookingRouter from './App/routes/booking.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Enable CORS for your frontend origin
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://moviesmagicdaa.netlify.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingRouter);

// Error handling middleware`
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

startServer();