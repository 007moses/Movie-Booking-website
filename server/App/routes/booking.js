import { Router } from 'express';
import { createBooking, getUserBookings, getBookingById, updateBookingStatus, cancelBooking } from '../controllers/booking-controller.js';
// import { protect } from '../../middleware/auth-middleware.js'; // Assuming auth middleware exists

const bookingRouter = Router();

// @desc    Create a new booking (validates showtime, screen, and seats; 3 movies max, 5 showtimes per screen per day)
// @route   POST /api/bookings
// @access  Private
bookingRouter.post('/', createBooking);

// @desc    Get all bookings for a user (includes movie, theater, and screen details)
// @route   GET /api/bookings
// @access  Private
bookingRouter.get('/', getUserBookings);

// @desc    Get a single booking by ID (includes movie, theater, and screen details)
// @route   GET /api/bookings/:id
// @access  Private
bookingRouter.get('/:id',  getBookingById);

// @desc    Update booking status (e.g., confirm after payment; restricted fields protected)
// @route   PATCH /api/bookings/:id
// @access  Private
bookingRouter.patch('/:id', updateBookingStatus);

// @desc    Cancel a booking (reverts seat availability)
// @route   DELETE /api/bookings/:id
// @access  Private
bookingRouter.delete('/:id', cancelBooking);

export default bookingRouter;