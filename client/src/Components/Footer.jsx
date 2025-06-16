import React from 'react';
import '../Styles/Footer.css';
import {FaInstagram,FaLinkedin,FaFacebook} from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Movie Booking</h3>
          <p className="footer-text">
            Your one-stop platform for seamless movie ticket booking. Experience cinema like never before.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/" className="footer-link">Home</a></li>
            <li><a href="/about" className="footer-link">About Us</a></li>
            <li><a href="/movies" className="footer-link">Movies</a></li>
            {/* <li><a href="/contact" className="footer-link">Contact</a></li> */}
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Connect With Us</h3>
          <div className="footer-social-links">
            <a href="https://www.linkedin.com/in/moses0511/" target='_blank' className="footer-social-link"><FaLinkedin />LinkedIn</a>
            <a href="https://www.instagram.com/mosesmoses307/" target='_blank' className="footer-social-link"><FaInstagram/> Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=100026702372864" target='_blank' className="footer-social-link"><FaFacebook/>Facebook</a>
          </div>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Contact Us</h3>
          <p className="footer-text">
            Email:{' '}
            <button href="mailto:support@moviebooking.com" className="footer-link">
              moses05112000@gmail.com
            </button>
          </p>
          <p className="footer-text">Phone: +91 7397356288</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Movie Booking. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;