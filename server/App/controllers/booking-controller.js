import Booking from '../models/Bookings.js';
import Movie from '../models/movie.js';
import Theater from '../models/Theater.js';
import Screen from '../models/Screen.js';
import asyncHandler from 'express-async-handler';


// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
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
    'seats.seatNumber': { $in: seats.map((s) => s.seatNumber) },
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
    ticketId: `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`,
  });

  console.log('Booking created:', booking);

  res.status(201).json({
    success: true,
    data: {
      ticketId: booking.ticketId,
      movieId: booking.movieId,
      theaterId: booking.theaterId,
      screenId: booking.showtime.screenId,
      showtime: booking.showtime.startTime,
      seats: booking.seats,
      totalPrice: booking.totalPrice,
    },
  });
});

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('movieId', 'title poster')
    .populate('theaterId', 'name city')
    .populate('showtime.screenId', 'screenNumber')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: bookings.map((booking) => ({
      id: booking._id,
      movieTitle: booking.movieId.title,
      theater: booking.theaterId.name,
      screenNumber: booking.showtime.screenId.screenNumber,
      showtime: booking.showtime.startTime,
      seats: booking.seats,
      totalPrice: booking.totalPrice,
      ticketId: booking.ticketId,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    })),
  });
});

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('movieId', 'title poster')
    .populate('theaterId', 'name city')
    .populate('showtime.screenId', 'screenNumber');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this booking');
  }

  res.status(200).json({
    success: true,
    data: {
      id: booking._id,
      movieTitle: booking.movieId.title,
      theater: booking.theaterId.name,
      screenNumber: booking.showtime.screenId.screenNumber,
      showtime: booking.showtime.startTime,
      seats: booking.seats,
      totalPrice: booking.totalPrice,
      ticketId: booking.ticketId,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    },
  });
});

// @desc    Get booked seats for a showtime and screen
// @route   GET /api/bookings/seats
// @access  Public
const getBookedSeats = asyncHandler(async (req, res) => {
  const { theaterId, screenId, startTime } = req.query;

  if (!theaterId || !screenId || !startTime) {
    res.status(400);
    throw new Error('Theater ID, Screen ID, and Start Time are required');
  }

  const bookings = await Booking.find({
    theaterId,
    'showtime.screenId': screenId,
    'showtime.startTime': new Date(startTime),
    status: { $ne: 'CANCELLED' },
  });

  const bookedSeats = bookings.flatMap((booking) => booking.seats.map((seat) => seat.seatNumber));

  res.status(200).json({
    success: true,
    bookedSeats,
  });
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }

  if (status && !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
    res.status(400);
    throw new Error('Invalid booking status');
  }

  if (paymentStatus && !['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
    res.status(400);
    throw new Error('Invalid payment status');
  }

  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  const updatedBooking = await booking.save();
  res.status(200).json({
    success: true,
    data: {
      id: updatedBooking._id,
      movieTitle: updatedBooking.movieId.title,
      theater: updatedBooking.theaterId.name,
      screenNumber: updatedBooking.showtime.screenId.screenNumber,
      showtime: updatedBooking.showtime.startTime,
      seats: updatedBooking.seats,
      totalPrice: updatedBooking.totalPrice,
      ticketId: updatedBooking.ticketId,
      status: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
    },
  });
});

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status === 'CANCELLED') {
    res.status(400);
    throw new Error('Booking is already cancelled');
  }

  await Screen.updateOne(
    { _id: booking.showtime.screenId },
    {
      $set: {
        'seatLayout.$[elem].isAvailable': true,
      },
    },
    {
      arrayFilters: [{ 'elem.seatNumber': { $in: booking.seats.map((s) => s.seatNumber) } }],
    }
  );

  booking.status = 'CANCELLED';
  booking.paymentStatus = 'REFUNDED';

  const updatedBooking = await booking.save();
  res.status(200).json({
    success: true,
    data: updatedBooking,
  });
});

export { createBooking, getUserBookings, getBookingById, getBookedSeats, updateBookingStatus, cancelBooking };