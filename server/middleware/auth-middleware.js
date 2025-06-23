import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401);
      throw new Error('No token provided');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id };
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Invalid token');
  }
});

export default protect;