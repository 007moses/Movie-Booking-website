
import React, { useState } from 'react';
import '../Styles/Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token'); // Check if token exists in localStorage

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="/" className="logo-text">
            🎬 MovieMagic
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <button onClick={() => navigate("/movies")} className="navbar-link">
            Movies
          </button>
          <button onClick={() => navigate("/bookings")} className="navbar-link">
            My Bookings
          </button>
          <button onClick={() => navigate("/theaters")} className="navbar-link">
            Theaters
          </button>
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/profile')}
              className="navbar-profile-icon"
              aria-label="User Profile"
            >
              <svg
                className="profile-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="navbar-login">
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="navbar-mobile-toggle">
          <button
            onClick={toggleMobileMenu}
            className="mobile-toggle-btn"
            aria-label="Toggle menu"
          >
            <svg
              className="toggle-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <button onClick={() => navigate("/movies")} className="navbar-mobile-link">
            Movies
          </button>
          <button onClick={() => navigate("/bookings")} className="navbar-mobile-link">
            My Bookings
          </button>
          <button onClick={() => navigate("/theaters")} className="navbar-mobile-link">
            Theaters
          </button>
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/profile')}
              className="navbar-mobile-profile-icon"
              aria-label="User Profile"
            >
              <svg
                className="profile-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              Profile
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="navbar-mobile-login">
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
