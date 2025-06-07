import Booking from '../models/Bookings.js';
import Movie from '../models/movie.js';
import Theater from '../models/Theater.js';
import Screen from '../models/Screen.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { movieId, theaterId, screenId, showtime, seats, totalPrice } = req.body;

  // Validate input
  const missingFields = [];
  if (!movieId) missingFields.push('movieId');
  if (!theaterId) missingFields.push('theaterId');
  if (!screenId) missingFields.push('screenId');
  if (!showtime) missingFields.push('showtime');
  if (!seats) missingFields.push('seats');
  if (!totalPrice) missingFields.push('totalPrice');

  if (missingFields.length > 0) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate showtime format
  if (!showtime.startTime) {
    res.status(400);
    throw new Error('Showtime must include startTime');
  }

  // Validate seats format
  for (const seat of seats) {
    if (!seat.seatNumber || !seat.seatType) {
      res.status(400);
      throw new Error('Each seat must have seatNumber and seatType');
    }
    if (!['STANDARD', 'PREMIUM', 'VIP'].includes(seat.seatType)) {
      res.status(400);
      throw new Error('Invalid seat type. Must be STANDARD, PREMIUM, or VIP');
    }
  }

  // Check if movie exists
  const movie = await Movie.findById(movieId);
  if (!movie) {
    res.status(404);
    throw new Error('Movie not found');
  }

  // Check if theater exists
  const theater = await Theater.findById(theaterId);
  if (!theater) {
    res.status(404);
    throw new Error('Theater not found');
  }

  // Check if screen exists and belongs to theater
  const screen = await Screen.findById(screenId);
  if (!screen || !screen.theaterId.equals(theaterId)) {
    res.status(404);
    throw new Error('Screen not found or does not belong to this theater');
  }

  // Validate showtime exists in theater
  const showtimeExists = theater.showtimes.some(
    (s) =>
      s.movieId.equals(movieId) &&
      s.showDateTime.getTime() === new Date(showtime.startTime).getTime() &&
      s.screenNumber === screen.screenNumber
  );
  if (!showtimeExists) {
    res.status(400);
    throw new Error('Invalid showtime for this movie and theater');
  }

  // Validate showtime is between 8 AM and 11:59 PM
  const hour = new Date(showtime.startTime).getHours();
  if (hour < 8 || hour > 23) {
    res.status(400);
    throw new Error('Showtime must be between 8 AM and 11:59 PM');
  }

  // Check seat availability
  const unavailableSeats = await Booking.find({
    theaterId,
    'showtime.screenId': screenId,
    'showtime.startTime': new Date(showtime.startTime),
    'seats.seatNumber': { $in: seats.map(s => s.seatNumber) },
    status: { $ne: 'CANCELLED' },
  });

  if (unavailableSeats.length > 0) {
    res.status(400);
    throw new Error('Some seats are already booked');
  }

  // Validate seats exist in screen
  for (const seat of seats) {
    const seatExists = screen.seatLayout.some(
      (s) => s.seatNumber === seat.seatNumber && s.seatType === seat.seatType && s.isAvailable
    );
    if (!seatExists) {
      res.status(400);
      throw new Error(`Seat ${seat.seatNumber} (${seat.seatType}) is invalid or unavailable`);
    }
  }

  try {
    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      movieId,
      theaterId,
      showtime: { startTime: new Date(showtime.startTime), screenId },
      seats,
      totalPrice,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    res.status(400);
    throw error;
  }
};

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('movieId', 'title poster')
    .populate('theaterId', 'name city')
    .populate('showtime.screenId', 'screenNumber')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: bookings,
  });
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('movieId', 'title poster')
    .populate('theaterId', 'name city')
    .populate('showtime.screenId', 'screenNumber');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure user owns the booking
  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this booking');
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
};

// @desc    Update booking status (e.g., confirm after payment)
// @route   PATCH /api/bookings/:id
// @access  Private
const updateBookingStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure user owns the booking
  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }

  // Validate status
  if (status && !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
    res.status(400);
    throw new Error('Invalid booking status');
  }

  // Validate payment status
  if (paymentStatus && !['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
    res.status(400);
    throw new Error('Invalid payment status');
  }

  // Update booking
  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  try {
    const updatedBooking = await booking.save();
    res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    res.status(400);
    throw error;
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure user owns the booking
  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  // Check if already cancelled
  if (booking.status === 'CANCELLED') {
    res.status(400);
    throw new Error('Booking is already cancelled');
  }

  // Update seat availability in Screen
  await Screen.updateOne(
    { _id: booking.showtime.screenId },
    {
      $set: {
        'seatLayout.$[elem].isAvailable': true,
      },
    },
    {
      arrayFilters: [{ 'elem.seatNumber': { $in: booking.seats.map(s => s.seatNumber) } }],
    }
  );

  booking.status = 'CANCELLED';
  booking.paymentStatus = 'REFUNDED';

  try {
    const updatedBooking = await booking.save();
    res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    res.status(400);
    throw error;
  }
};

export { createBooking, getUserBookings, getBookingById, updateBookingStatus, cancelBooking };