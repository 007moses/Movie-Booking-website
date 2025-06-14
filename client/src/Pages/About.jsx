import React from 'react';
import '../Styles/About.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">About Us</h1>
          <p className="hero-subtitle">
            Discover the passion behind your favorite movie booking experience
          </p>
        </div>
      </div>
      <div className="about-content">
        <section className="mission-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            At Movie Booking, we aim to bring the magic of cinema to your fingertips. Our mission is to provide a seamless, user-friendly platform for booking movie tickets, ensuring every moviegoer enjoys a hassle-free experience from selection to screen.
          </p>
        </section>
        <section className="team-section">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-image-placeholder"></div>
              <h3 className="team-name">Jane Doe</h3>
              <p className="team-role">Founder & CEO</p>
              <p className="team-bio">
                A cinephile with a vision to revolutionize movie ticketing.
              </p>
            </div>
            <div className="team-card">
              <div className="team-image-placeholder"></div>
              <h3 className="team-name">John Smith</h3>
              <p className="team-role">CTO</p>
              <p className="team-bio">
                Tech wizard building the future of cinema booking.
              </p>
            </div>
            <div className="team-card">
              <div className="team-image-placeholder"></div>
              <h3 className="team-name">Emily Johnson</h3>
              <p className="team-role">Head of Design</p>
              <p className="team-bio">
                Crafting visually stunning and intuitive user experiences.
              </p>
            </div>
          </div>
        </section>
        <section className="contact-section">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-text">
            Have questions or feedback? We'd love to hear from you! Reach out to us at{' '}
            <a href="mailto:support@moviebooking.com" className="contact-link">
              support@moviebooking.com
            </a>{' '}
            or follow us on social media.
          </p>
          <div className="social-links">
            <a href="#" className="social-link">
              Twitter
            </a>
            <a href="#" className="social-link">
              Instagram
            </a>
            <a href="#" className="social-link">
              Facebook
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;