import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theater name is required'],
    trim: true,
    maxlength: [100, 'Theater name cannot exceed 100 characters'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [255, 'Address cannot exceed 255 characters'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters'],
  },
  image: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i,
      'Image must be a valid URL ending in .png, .jpg, .jpeg, .gif, .webp, or .svg'
    ],
    default: null,
  },
  showtimes: [{
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
      min: [1, 'Screen number must be at least 1'],
    },
    showDateTime: {
      type: Date,
      required: [true, 'Show date and time are required'],
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D',
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
    },
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
theaterSchema.index({ name: 'text', city: 'text' });
theaterSchema.index({ 'showtimes.movieId': 1, 'showtimes.showDateTime': 1 });

const Theater = mongoose.model('Theater', theaterSchema);

export default Theater;