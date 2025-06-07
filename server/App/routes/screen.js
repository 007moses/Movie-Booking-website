import { Router } from 'express';
import { createScreen, getScreensByTheater, getScreenById, updateScreen, deleteScreen } from '../controllers/screen-controller.js';
import { protect, admin } from '../../middleware/auth-middleware.js'; // Assuming auth middleware exists

const screenRouter = Router();

// @desc    Create a new screen for a theater (max 5 screens per theater)
// @route   POST /api/screens
// @access  Private (Admin)
screenRouter.post('/', protect, admin, createScreen);

// @desc    Get all screens for a theater (max 5 screens)
// @route   GET /api/screens/theater/:theaterId
// @access  Public
screenRouter.get('/theater/:theaterId', getScreensByTheater);

// @desc    Get a single screen by ID
// @route   GET /api/screens/:id
// @access  Public
screenRouter.get('/:id', getScreenById);

// @desc    Update screen details (max 5 screens per theater)
// @route   PATCH /api/screens/:id
// @access  Private (Admin)
screenRouter.patch('/:id', protect, admin, updateScreen);

// @desc    Delete a screen (only if no active bookings)
// @route   DELETE /api/screens/:id
// @access  Private (Admin)
screenRouter.delete('/:id', protect, admin, deleteScreen);

export default screenRouter;