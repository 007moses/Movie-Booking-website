import { Router } from 'express';
import { createBooking, getUserBookings, getBookingById, getBookedSeats, updateBookingStatus, cancelBooking } from '../controllers/booking-controller.js';
import protect from '../../middleware/auth-middleware.js';
import { Router } from 'express';

const bookingRouter = Router();

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
bookingRouter.post('/', protect, createBooking);

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
bookingRouter.get('/', protect, getUserBookings);

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
bookingRouter.get('/:id', protect, getBookingById);

// @desc    Get booked seats for a showtime and screen
// @route   GET /api/bookings/seats
// @access  Public
bookingRouter.get('/seats', getBookedSeats);

// @desc    Update booking status
// @route   PATCH /api/bookings/:id
// @access  Private
bookingRouter.patch('/:id', protect, updateBookingStatus);

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
bookingRouter.delete('/:id', protect, cancelBooking);

export default bookingRouter;