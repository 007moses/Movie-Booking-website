import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UseApiFetch from "../API-Method/UseApiFetch";
import "../Styles/MovieDetails.css";

const MovieDetails = () => {
  const [moviesData, setMoviesData] = useState([]);
  const [startInit, setStartInit] = useState(true);
  const { apiKey, serverRequest, fetchError, responseData, isLoading } = UseApiFetch();
  const theaters = useSelector((state) => state.theaters.theaters); // Get theaters from Redux
  const params = useParams();

  const GetMovies = () => {
    const requestConfig = {
      method: "GET",
      apiUrl: "/api/movies",
      apiKey: "GETMOVIES",
    };
    serverRequest(requestConfig);
  };

  const fnResponseForGetMovies = () => {
    if (Array.isArray(responseData)) {
      setMoviesData(responseData);
    } else {
      console.error("Invalid movie data:", responseData);
      setMoviesData([]);
    }
  };

  useEffect(() => {
    if (startInit) {
      GetMovies();
      setStartInit(false);
    } else if (!isLoading && apiKey === "GETMOVIES") {
      fnResponseForGetMovies();
    }
  }, [startInit, isLoading, apiKey, responseData, fetchError]);

  const movie = moviesData?.find((eachMovie) => eachMovie?.title.split(" ").join("-") === params.title);
  console.log(movie,"movie")
  return (
    <div className="movie-details-page">
      <h1 className="movie-details-title">{movie?.title}</h1>
      <div className="movie-details-container">
        <div className="movie-poster-section">
          <img src={movie?.poster} alt={movie?.title} className="movie-poster" />
        </div>
        <div className="movie-info-section">
          <p className="movie-info">
            <strong>Genre:</strong> {movie?.genre}
          </p>
          <p className="movie-info">
            <strong>Duration:</strong> {movie?.duration}
          </p>
          <p className="movie-info">
            <strong>Rating:</strong> {movie?.rating}
          </p>
          <p className="movie-cast">
            <strong>Cast:</strong> {movie?.cast?.join(", ") || "To be announced"}
          </p>
        </div>
      </div>
      <h2 className="showtimes-title">Available Showtimes</h2>
      {theaters?.length === 0 ? (
        <p className="no-showtimes">No showtimes available for this movie.</p>
      ) : (
        <div className="theaters-grid">
          {theaters?.map((theater) => (
            <div key={theater?._id} className="theater-card">
              <h3 className="theater-name">{theater?.name}</h3>
              <p className="theater-address">{theater?.address}</p>
              <div className="showtimes-list">
                {theater?.showtimes
                  .filter((showtime) => showtime.movieId?.title === movie?.title)
                  .map((showtime, index) => (
                    <Link
                      key={index}
                      to={`/booking/${movie?._id}/${theater?._id}/${encodeURIComponent(showtime.startTime)}`}
                      className="showtime-btn"
                    >
                      {new Date(showtime.startTime).toLocaleString()}
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