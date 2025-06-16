import { Router } from 'express';
import { forgotPassword, loginUser, registerUser, resetPassword, getUserDetails, updateUserDetails, sendOtp, verifyOtp } from '../controllers/user-controller.js';
import authMiddleware from '../../middleware/auth-middleware.js';
import protect from '../../middleware/auth-middleware.js';

const authRouter = Router();

// Register
authRouter.post('/register', registerUser);

// Login
authRouter.post('/login', loginUser);

// Forgot Password
authRouter.post('/forgot-password', forgotPassword);

// Reset Password
authRouter.post('/reset-password/:token', resetPassword);

// Get User Details (Protected)
authRouter.get('/user', protect, getUserDetails);

// Update User Details (Protected)
authRouter.post('/user/update', protect, updateUserDetails);

// Send OTP (Protected)
authRouter.post('/send-otp', protect, sendOtp);

// Verify OTP (Protected)
authRouter.post('/verify-otp', authMiddleware, verifyOtp);

export default authRouter;