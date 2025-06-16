import User from '../models/User-model.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import generateToken from '../../utility/generateToken.js';

dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER || "moses05112000@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    res.status(400);
    throw new Error('Email or mobile number, password, and confirmPassword are required');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  let userData = { password, fullName: '', mobileNumber: '', email: null };

  if (emailRegex.test(email)) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
    userData.email = email;
  } else if (mobileRegex.test(email)) {
    const userExists = await User.findOne({ mobileNumber: email });
    if (userExists) {
      res.status(400);
      throw new Error('Mobile number already exists');
    }
    userData.mobileNumber = email;
  } else {
    res.status(400);
    throw new Error('Invalid email or mobile number');
  }

  const user = await User.create(userData);
  user.password = undefined;

  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    token: generateToken(user._id),
    message: "User registered successfully",
    register: true,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  let user;

  if (emailRegex.test(email)) {
    user = await User.findOne({ email });
  } else if (mobileRegex.test(email)) {
    user = await User.findOne({ mobileNumber: email });
  }

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    token: generateToken(user._id),
    message: "User logged in successfully",
    login: true,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset Request',
    text: `You are receiving this email because you (or someone else) requested a password reset.
           Please click on the following link to reset your password:
           ${resetUrl}
           If you did not request this, please ignore this email.`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'Password reset email sent', forgotPassword: true });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully', resetPassword: true });
});

export const getUserDetails = asyncHandler(async (req, res) => {
  
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    message: 'User details retrieved successfully',
    getUser: true,
  });
});

export const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, password } = req.body;

  if (!fullName && !email && !mobileNumber && !password) {
    res.status(400);
    throw new Error('At least one field is required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = email;
  }

  if (mobileNumber && mobileNumber !== user.mobileNumber && mobileNumber !== '') {
    const mobileExists = await User.findOne({ mobileNumber });
    if (mobileExists) {
      res.status(400);
      throw new Error('Mobile number already in use');
    }
    user.mobileNumber = mobileNumber;
  }

  if (fullName !== undefined) {
    user.fullName = fullName;
  }
  if (password) {
    user.password = password;
  }

  await user.save();

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    message: 'User details updated successfully',
    update: true,
  });
});

export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'OTP for Password Change',
    text: `Your OTP for changing your password is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'OTP sent to email', sendOtp: true });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.status(200).json({ message: 'OTP verified successfully', verifyOtp: true });
});