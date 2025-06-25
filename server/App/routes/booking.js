import express from 'express';
import { createBooking, getBookedSeats, getUserBookings, getBookingById } from '../controllers/booking-controller.js';
import protect from '../../middleware/auth-middleware.js';

const BookingRouter = express.Router();

BookingRouter.post('/', protect, createBooking);
BookingRouter.get('/seats', getBookedSeats);
BookingRouter.get('/user', protect, getUserBookings);
BookingRouter.get('/:ticketId', protect, getBookingById);

export default BookingRouter;