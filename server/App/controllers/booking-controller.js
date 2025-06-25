import asyncHandler from 'express-async-handler';
import Booking from '../models/Bookings.js';
import { v4 as uuidv4 } from 'uuid';

const createBooking = asyncHandler(async (req, res) => {
  const {
    movieName,
    theaterName,
    screenNumber,
    showtime,
    seats,
    totalPrice,
    user,
  } = req.body;

  // Validate input
  if (
    !movieName ||
    !theaterName ||
    !screenNumber ||
    !showtime ||
    !seats ||
    !totalPrice ||
    !user ||
    !user.userId ||
    !user.name || 
    !user.email
  ) {
    res.status(400);
    throw new Error('All fields are required');
  }

  // Check if seats are already booked
  const existingBooking = await Booking.findOne({
    screenNumber,
    showtime,
    'seats.seatNumber': { $in: seats.map((s) => s.seatNumber) },
  });

  if (existingBooking) {
    res.status(400);
    throw new Error('One or more seats are already booked');
  }

  // Create booking
  const booking = new Booking({
    ticketId: uuidv4(),
    movieName,
    theaterName,
    screenNumber,
    showtime,
    seats,
    totalPrice,
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
    },
  });

  const savedBooking = await booking.save();

  res.status(201).json({
    success: true,
    data: {
      ticketId: savedBooking.ticketId,
      seats: savedBooking.seats,
      totalPrice: savedBooking.totalPrice,
    },
  });
});

const getBookedSeats = asyncHandler(async (req, res) => {
  const { screenNumber, showtime } = req.body;

  if (!screenNumber || !showtime) {
    res.status(400);
    throw new Error('Screen Number and Showtime are required');
  }

  const bookings = await Booking.find({
    screenNumber: Number(screenNumber),
    showtime: new Date(showtime),
  });

  const bookedSeats = bookings.flatMap((booking) => booking.seats.map((seat) => seat.seatNumber));

  res.status(200).json({
    success: true,
    bookedSeats,
  });
});

const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({ 'user.userId': userId });

  res.status(200).json({
    success: true,
    data: bookings,
  });
});

const getBookingById = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findOne({ ticketId, 'user.userId': userId });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

export { createBooking, getBookedSeats, getUserBookings, getBookingById };