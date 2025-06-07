import { Router } from 'express';
import { forgotPassword, loginUser, registerUser, resetPassword, getUserDetails, updateUserDetails, sendOtp, verifyOtp } from '../controllers/user-controller.js';
import authMiddleware from '../../middleware/auth-middleware.js';

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
authRouter.get('/user', authMiddleware, getUserDetails);

// Update User Details (Protected)
authRouter.post('/user/update', authMiddleware, updateUserDetails);

// Send OTP (Protected)
authRouter.post('/send-otp', authMiddleware, sendOtp);

// Verify OTP (Protected)
authRouter.post('/verify-otp', authMiddleware, verifyOtp);

export default authRouter;