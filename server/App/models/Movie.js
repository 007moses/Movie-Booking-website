// import mongoose from "mongoose";

// const movieSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Movie title is required'],
//     trim: true,
//     maxlength: [100, 'Title cannot exceed 100 characters'],
//   },
//   poster: {
//     type: String,
//     required: [true, 'Poster URL is required'],
//     trim: true,
//   },
//   description: {
//     type: String,
//     trim: true,
//     maxlength: [500, 'Description cannot exceed 500 characters'],
//   },
//   genre: {
//     type: [String],
//     required: [true, 'At least one genre is required'],
//     enum: [
//       'Action',
//       'Comedy',
//       'Drama',
//       'Thriller',
//       'Horror',
//       'Romance',
//       'Sci-Fi',
//       'Fantasy',
//       'Animation',
//       'Documentary',
//     ],
//   },
//   language: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   duration: {
//     type: Number, // Duration in minutes
//     required: true,
//     min: [1, 'Duration must be at least 1 minute'],
//   },
//   releaseDate: {
//     type: Date,
//     required: true,
//   },
//   showtimes: [
//     {
//       theaterId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Theater',
//         required: true,
//       },
//       times: [
//         {
//           startTime: {
//             type: Date,
//             required: true,
//           },
//           availableSeats: {
//             type: Number,
//             required: true,
//             min: [0, 'Available seats cannot be negative'],
//           },
//         },
//       ],
//     },
//   ],
//   rating: {
//     type: String,
//     enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', null],
//     default: null,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Index for efficient searching and filtering
// movieSchema.index({ title: 'text' });
// movieSchema.index({ genre: 1 });
// movieSchema.index({ language: 1 });
// movieSchema.index({ releaseDate: 1 });

// const Movie = mongoose.model('movies', movieSchema);

// export default Movie


// const mongoose = require('mongoose');
import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'], // duration in minutes
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
  },
  poster: {
    type: String,
    required: [true, 'Poster URL is required'],
  },
  genre: {
    type: String,
    default: 'Unknown'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie; 

