import { createTheater, getTheaters, getTheaterById, updateTheater, deleteTheater } from '../controllers/theater-controller.js';
import { Router } from 'express';
// import { protect, admin } from '../../middleware/auth-middleware.js'; // Assuming auth middleware exists

const theaterRouter = Router();

// @desc    Create a new theater (max 5 screens, 3 unique movies, 5 showtimes per screen per day)
// @route   POST /api/theaters
// @access  Private (Admin)
theaterRouter.post('/',createTheater);

// @desc    Get all theaters with their showtimes (3 movies max, 5 showtimes per screen per day)
// @route   GET /api/theaters
// @access  Public
theaterRouter.get('/', getTheaters);

// @desc    Get a single theater by ID with showtimes (3 movies max, 5 showtimes per screen per day)
// @route   GET /api/theaters/:ida
// @access  Public
theaterRouter.get('/:id', getTheaterById);

// @desc    Update theater details or showtimes (max 5 screens, 3 unique movies, 5 showtimes per screen per day)
// @route   PATCH /api/theaters/:id
// @access  Private (Admin)
theaterRouter.patch('/:id', updateTheater);

// @desc    Delete a theater (only if no active bookings or screens)
// @route   DELETE /api/theaters/:id
// @access  Private (Admin)
theaterRouter.delete('/:id', deleteTheater);

export default theaterRouter;