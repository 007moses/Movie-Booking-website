// import Movie from '../models/movie.js';

// const createMovie = async (req, res) => {
//       try {
//     const movie = new Movie(req.body);
//     await movie.save();
//     res.status(201).json(movie);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// //   const movie = await Movie.create(req.body);

// //   res.status(201).json({
// //     success: true,
// //     data: movie,
// //   });
// };

// // @desc    Get all movies with optional filters
// // @route   GET /api/movies
// // @access  Public
// const getMovies = async (req, res) => {
//   const { genre, language, releaseDate, page = 1, limit = 10 } = req.query;

//   // Build query object for filtering
//   const query = {};
//   if (genre) query.genre = { $in: genre.split(',') }; // Support multiple genres
//   if (language) query.language = language;
//   if (releaseDate) query.releaseDate = { $gte: new Date(releaseDate) };

//   // Pagination
//   const skip = (page - 1) * limit;

//   // Fetch movies with filters and pagination
//   const movies = await Movie.find(query)
//     .select('title poster releaseDate genre language duration')
//     .skip(skip)
//     .limit(parseInt(limit))
//     .lean();

//   // Get total count for pagination
//   const totalMovies = await Movie.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     data: movies,
//     pagination: {
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(totalMovies / limit),
//       totalMovies,
//     },
//   });
// };

// // @desc    Get single movie by ID
// // @route   GET /api/movies/:id
// // @access  Public
// const getMovieById = async (req, res) => {
//   const movie = await Movie.findById(req.params.id)
//     .select('-__v') // Exclude version key
//     .lean();

//   if (!movie) {
//     res.status(404);
//     throw new Error('Movie not found');
//   }

//   res.status(200).json({
//     success: true,
//     data: movie,
//   });
// };

// // @desc    Search movies by title
// // @route   GET /api/movies/search
// // @access  Public
// const searchMovies = async (req, res) => {
//   const { q, page = 1, limit = 10 } = req.query;

//   if (!q) {
//     res.status(400);
//     throw new Error('Search query is required');
//   }

//   // Search by title (case-insensitive)
//   const query = { title: { $regex: q, $options: 'i' } };
//   const skip = (page - 1) * limit;

//   const movies = await Movie.find(query)
//     .select('title poster releaseDate genre language')
//     .skip(skip)
//     .limit(parseInt(limit))
//     .lean();

//   const totalMovies = await Movie.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     data: movies,
//     pagination: {
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(totalMovies / limit),
//       totalMovies,
//     },
//   });
// };

// export { createMovie, getMovies, getMovieById, searchMovies };




import Movie from "../models/movie.js";

// Create a new movie
const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

// Get a single movie by ID
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

// Update a movie
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.status(200).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a movie
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};

export {getAllMovies,getMovieById,deleteMovie,updateMovie,createMovie};