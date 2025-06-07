import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch movie details and theaters with showtimes
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieResponse = await axios.get(`http://localhost:5000/api/movies/${id}`);
        setMovie(movieResponse.data);

        // Fetch theaters with sample showtimes for this movie
        const theatersResponse = await axios.get(`http://localhost:5000/api/theaters?movieId=${id}`);
        setTheaters(theatersResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load movie details.');
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="movie-details-page">
      <h1 className="movie-details-title">{movie.title}</h1>
      <div className="movie-details-container">
        <div className="movie-poster-section">
          <img src={movie.poster} alt={movie.title} className="movie-poster" />
        </div>
        <div className="movie-info-section">
          <p className="movie-info"><strong>Genre:</strong> {movie.genre}</p>
          <p className="movie-info"><strong>Duration:</strong> {movie.duration}</p>
          <p className="movie-info"><strong>Rating:</strong> {movie.rating}</p>
          <p className="movie-synopsis">
            <strong>Synopsis:</strong> {movie.synopsis || 'A thrilling cinematic experience awaits!'}
          </p>
          <p className="movie-cast">
            <strong>Cast:</strong> {movie.cast?.join(', ') || 'To be announced'}
          </p>
        </div>
      </div>
      <h2 className="showtimes-title">Available Showtimes</h2>
      {theaters.length === 0 ? (
        <p className="no-showtimes">No showtimes available for this movie.</p>
      ) : (
        <div className="theaters-grid">
          {theaters.map((theater) => (
            <div key={theater.id} className="theater-card">
              <h3 className="theater-name">{theater.name}</h3>
              <p className="theater-address">{theater.address}</p>
              <div className="showtimes-list">
                {theater.showtimes.map((showtime, index) => (
                  <Link
                    key={index}
                    to={`/booking/${movie.id}/${theater.id}/${encodeURIComponent(showtime)}`}
                    className="showtime-btn"
                  >
                    {showtime}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieDetails;

