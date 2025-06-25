import express from 'express';
import { createBooking, getBookedSeats } from '../controllers/booking-controller.js';
import protect from '../../middleware/auth-middleware.js';

const BookingRouter = express.Router();

BookingRouter.post('/', protect, createBooking);
BookingRouter.get('/seats', getBookedSeats);

export default BookingRouter;       