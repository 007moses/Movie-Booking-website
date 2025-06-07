import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie ID is required'],
  },
  theaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: [true, 'Theater ID is required'],
  },
  showtime: {
    startTime: {
      type: Date,
      required: [true, 'Showtime start time is required'],
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen ID is required'],
    },
  },
  seats: [{
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true,
    },
    seatType: {
      type: String,
      enum: ['STANDARD', 'PREMIUM', 'VIP'],
      required: [true, 'Seat type is required'],
    },
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
bookingSchema.index({ userId: 1 });
bookingSchema.index({ movieId: 1 });
bookingSchema.index({ theaterId: 1 });
bookingSchema.index({ 'showtime.startTime': 1, 'showtime.screenId': 1 });

// Pre-save validation
bookingSchema.pre('save', async function (next) {
  const { theaterId, movieId, showtime, seats } = this;

  // Validate showtime exists in Theater
  const theater = await mongoose.model('Theater').findById(theaterId);
  if (!theater) {
    return next(new Error('Theater not found'));
  }

  const showtimeExists = theater.showtimes.some(
    (s) =>
      s.movieId.equals(movieId) &&
      s.showDateTime.getTime() === showtime.startTime.getTime() &&
      s.screenNumber === (mongoose.model('Screen').findById(showtime.screenId)).screenNumber
  );
  if (!showtimeExists) {
    return next(new Error('Invalid showtime for this theater and movie'));
  }

  // Validate screen exists and belongs to theater
  const screen = await mongoose.model('Screen').findById(showtime.screenId);
  if (!screen || !screen.theaterId.equals(theaterId)) {
    return next(new Error('Invalid screen for this theater'));
  }

  // Validate seats exist and are available
  for (const seat of seats) {
    const seatExists = screen.seatLayout.some(
      (s) => s.seatNumber === seat.seatNumber && s.seatType === seat.seatType && s.isAvailable
    );
    if (!seatExists) {
      return next(new Error(`Seat ${seat.seatNumber} (${seat.seatType}) is invalid or unavailable`));
    }
  }

  // Validate movie is one of the 3 active movies
  const uniqueMovies = new Set(theater.showtimes.map(s => s.movieId.toString()));
  if (!uniqueMovies.has(movieId.toString()) || uniqueMovies.size > 3) {
    return next(new Error('Movie is not currently showing at this theater'));
  }

  // Validate showtime is between 8 AM and 11:59 PM
  const hour = showtime.startTime.getHours();
  if (hour < 8 || hour > 23) {
    return next(new Error('Showtime must be between 8 AM and 11:59 PM'));
  }

  // Update seat availability
  await mongoose.model('Screen').updateOne(
    { _id: showtime.screenId },
    {
      $set: {
        'seatLayout.$[elem].isAvailable': false,
      },
    },
    {
      arrayFilters: [{ 'elem.seatNumber': { $in: seats.map(s => s.seatNumber) } }],
    }
  );

  next();
});

// Pre-update hook to prevent modifying critical fields
bookingSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.movieId || update.theaterId || update.showtime || update.seats) {
    return next(new Error('Cannot modify movieId, theaterId, showtime, or seats after booking'));
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;