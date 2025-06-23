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
      required: [true, 'Seat type is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  }],
}, {
  timestamps: true,
});

screenSchema.index({ theaterId: 1, screenNumber: 1 }, { unique: true });

const Screen = mongoose.model('Screen', screenSchema);

export default Screen;