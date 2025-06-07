import express, { Router } from 'express';
import {getAllMovies,getMovieById,createMovie,updateMovie,deleteMovie} from '../controllers/movie-controlller.js'

const MoviesRouter = Router();

// Route to create a new movie
MoviesRouter.post('/', createMovie);

// Route to get all movies with optional filters
MoviesRouter.get('/', getAllMovies);

// Route to get a single movie by ID
MoviesRouter.get('/:id', getMovieById);

// Route to Update movies by title
MoviesRouter.put('/:id', updateMovie);

MoviesRouter.delete('/:id', deleteMovie)



export default MoviesRouter;