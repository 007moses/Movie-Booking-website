import mongoose from "mongoose";

const screenSchema = new mongoose.Schema({
  theaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: [true, 'Theater ID is required'],
  },
  screenNumber: {
    type: Number,
    required: [true, 'Screen number is required'],
    min: [1, 'Screen number must be at least 1'],
    max: [5, 'Screen number cannot exceed 5'],
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1'],
  },
  seatLayout: [{
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true,
    },
    seatType: {
      type: String,
      enum: ['STANDARD', 'PREMIUM', 'VIP'],
      default: 'STANDARD',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
screenSchema.index({ theaterId: 1, screenNumber: 1 }, { unique: true });
screenSchema.index({ theaterId: 1 });

// Validate maximum 5 screens per theater
screenSchema.pre('save', async function (next) {
  const screenCount = await mongoose.model('Screen').countDocuments({ theaterId: this.theaterId });
  if (screenCount >= 5 && !this.isModified('theaterId')) {
    return next(new Error('A theater cannot have more than 5 screens'));
  }
  next();
});

const Screen = mongoose.model('Screen', screenSchema);

export default Screen;