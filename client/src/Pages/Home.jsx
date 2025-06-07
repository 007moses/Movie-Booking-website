import React from 'react';
import '../Styles/Home.css';
import Intrestellar from "../assets/Interstellar.jpg"
import Inception from "../assets/Inception1.webp"
import DarkKnight from "../assets/The dark knight.webp"
import Oppenheimer from "../assets/Oppenheimer.webp"
import { useNavigate } from 'react-router-dom';

const Home = () => {
  // Sample featured movies (using the same posters as Movies.jsx)
  const featuredMovies = [
    {
      id: 1,
      title: 'Interstellar',
      poster: Intrestellar,
    },
    {
      id: 2,
      title: 'The Dark Knight',
      poster: DarkKnight,
    },
    {
      id: 3,
      title: 'Inception',
      poster: Inception,
    },
  ];

    const navigate = useNavigate()
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
                <a
                  href={`/booking/${movie.id}`}
                  className="featured-book-btn"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <button onClick={()=>navigate("/movies")} className="view-all-btn">
            View All Movies
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;