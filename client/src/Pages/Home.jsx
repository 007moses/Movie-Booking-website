import React from "react";
import "../Styles/Home.css";
import Intrestellar from "../assets/Interstellar.jpg";
import Inception from "../assets/Inception1.webp";
import DarkKnight from "../assets/The dark knight.webp";
import Oppenheimer from "../assets/Oppenheimer.webp";
import { useNavigate } from "react-router-dom";

const Home = () => {
  // Sample featured movies (using the same posters as Movies.jsx)
  const featuredMovies = [
    {
      title: "Interstellar",
      releaseDate: "2014-11-07",
      duration: 169,
      trailer: "https://www.youtube.com/watch?v=Z1BCujX3pw8",
      language: "English",
      synopsis:
        "In Earth's future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. Professor Brand (Michael Caine), a brilliant NASA physicist, is working on plans to save mankind by transporting Earth's population to a new home via a wormhole. But first, Brand must send former NASA pilot Cooper (Matthew McConaughey) and a team of researchers through the wormhole and across the galaxy to find out which of three planets could be mankind's new home",
      poster: "https://i.postimg.cc/XXS0nhch/Interstellar.jpg",
      genre: "Science Fiction",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    },
    {
      title: "The Dark Knight",
      releaseDate: "2008-07-18",
      duration: 152,
      trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      language: "English",
      synopsis:
        "In Earth's future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. Professor Brand (Michael Caine), a brilliant NASA physicist, is working on plans to save mankind by transporting Earth's population to a new home via a wormhole. But first, Brand must send former NASA pilot Cooper (Matthew McConaughey) and a team of researchers through the wormhole and across the galaxy to find out which of three planets could be mankind's new home",
      poster: "https://i.postimg.cc/GhG4vnN4/The-dark-knight.webp",
      genre: "Action",
      description:
        "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
    },
    {
      title: "Inception",
      releaseDate: "2010-07-16",
      duration: 148,
      trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      language: "English",
      synopsis:
        "Dom Cobb (Leonardo DiCaprio) is a thief with the rare ability to enter people's dreams and steal their secrets from their subconscious. His skill has made him a hot commodity in the world of corporate espionage but has also cost him everything he loves. Cobb gets a chance at redemption when he is offered a seemingly impossible task: Plant an idea in someone's mind. If he succeeds, it will be the perfect crime, but a dangerous enemy anticipates Cobb's every move",
      poster: "https://i.postimg.cc/x1V0Qk6C/Inception.jpg",
      genre: "Sci-Fi",
      description:
        "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    },
  ];

  const navigate = useNavigate();
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Experience Movies Like Never Before</h1>
          <p className="hero-subtitle">
            Book your tickets now and dive into a world of cinematic adventures!
          </p>
          <a href="/movies" className="hero-cta">
            Explore Movies
          </a>
        </div>
      </section>

      {/* Featured Movies Section */}
      <section className="featured-section">
        <h2 className="featured-title">Featured Movies</h2>
        <div className="featured-grid">
          {featuredMovies.map((movie) => (
            <div key={movie.id} className="featured-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="featured-poster"
              />
              <div className="featured-info">
                <h3 className="featured-movie-title">{movie.title}</h3>
                <button
                  href={`/booking/${movie.id}`}
                  className="featured-book-btn"
                  onClick={() => {
                    navigate(`/movies/${movie?.title.split(" ").join("-")}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <button
            onClick={() => {
              navigate("/movies")
              window.scrollTo(0,0)
            }}
            className="view-all-btn"
          >
            View All Movies
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
