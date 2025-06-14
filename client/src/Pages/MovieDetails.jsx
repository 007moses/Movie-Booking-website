import { useParams, Link, useNavigate } from "react-router-dom";
import UseApiFetch from "../API-Method/UseApiFetch";
import "../Styles/MovieDetails.css";
import MovieData from "../../../server/Data/Movies.json";
import TheaterData from "../../../server/Data/Theaters.json";
import ReactPlayer from "react-player";

const MovieDetails = () => {
  // const [moviesData, setMoviesData] = useState([]);
  // const [startInit, setStartInit] = useState(true);
  // const { apiKey, serverRequest, fetchError, responseData, isLoading } = UseApiFetch();
  const params = useParams();
  const navigate = useNavigate();

  // const GetMovies = () => {
  //   const requestConfig = {
  //     method: "GET",
  //     apiUrl: "/api/movies",
  //     apiKey: "GETMOVIES",
  //   };
  //   serverRequest(requestConfig);
  // };

  // const fnResponseForGetMovies = () => {
  //   if (Array.isArray(responseData)) {
  //     setMoviesData(responseData);
  //   } else {
  //     console.error("Invalid movie data:", responseData);
  //     setMoviesData([]);
  //   }
  // };

  // useEffect(() => {
  //   if (startInit) {
  //     GetMovies();
  //     setStartInit(false);
  //   } else if (!isLoading && apiKey === "GETMOVIES") {
  //     fnResponseForGetMovies();
  //   }
  // }, [startInit, isLoading, apiKey, responseData, fetchError]);

  const movie = MovieData?.find(
    (eachMovie) => eachMovie?.title.split(" ").join("-") === params.title
  );
  console.log(movie, "movie");

  const theaters = TheaterData.filter((eachTheater) =>
    eachTheater.showtimes.some(
      (showtime) => showtime.movieTitle === movie.title
    )
  );

  return (
    <div className="movie-details-page">
      <h1 className="movie-details-title">{movie?.title}</h1>
      <div className="movie-details-container">
        <div className="movie-poster-section">
          <img
            src={movie?.poster}
            alt={movie?.title}
            className="movie-poster"
          />
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
            <strong>Cast:</strong>{" "}
            {movie?.cast?.join(", ") || "To be announced"}
          </p>
          <p>
            <strong>Story:</strong> {movie?.synopsis}
          </p>
        </div>
      </div>
      <div className="trailer">
        <div className="trailer-container">
          <TrailerPlayer trailerUrl={movie.trailer} />
        </div>
      </div>

      <h2 className="showtimes-title">Available Theaters</h2>
      {theaters.length === 0 ? (
        <p className="no-showtimes">No Theaters available for this movie.</p>
      ) : (
        <div className="theaters-grid">
          {theaters.map((theater, id) => (
            <div
              key={id}
              className="theater-card"
              onClick={() =>{
                navigate(
                  `/${theater.name.split(" ").join("-")}/${movie.title
                    .split(" ")
                    .join("-")}/SeatBooking`
                )
                window.scrollTo(0,0)
              }
              }
            >
              <h3 className="theater-name">{theater.name}</h3>
              <img
                src={theater.image}
                alt={theater.name}
                className="theater-image"
              />
              <p className="theater-address">{theater.address}</p>
              <div className="showtimes-list">
                {theater.showtimes
                  .filter((showtime) => showtime.movieTitle === movie.title)
                  .map((showtime, index) => (
                    <div key={index}>{showtime.showDateTime}</div>
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

const TrailerPlayer = ({ trailerUrl }) => {
  return (
    <div className="trailer-container">
      <ReactPlayer url={trailerUrl} controls width="100%" height="100%" />
    </div>
  );
};
