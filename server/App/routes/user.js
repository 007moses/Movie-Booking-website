import { Router } from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, getUserDetails, updateUserDetails, sendOtp, verifyOtp } from '../controllers/user-controller.js';
import protect from '../../middleware/auth-middleware.js';

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);
userRouter.get('/profile', protect, getUserDetails);
userRouter.put('/profile', protect, updateUserDetails);
userRouter.post('/send-otp', sendOtp);
userRouter.post('/verify-otp', verifyOtp);

export default userRouter;