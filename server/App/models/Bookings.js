import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true,
  },
  movieName: {
    type: String,
    required: true,
  },
  theaterName: {
    type: String,
    required: true,
  },
  screenNumber: {
    type: Number,
    required: true,
  },
  showtime: {
    type: Date,
    required: true,
  },
  seats: [
    {
      seatNumber: {
        type: String,
        required: true,
      },
      seatType: {
        type: String,
        enum: ['STANDARD', 'PREMIUM', 'VIP'],
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Booking', bookingSchema);