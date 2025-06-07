import React, { useState, useEffect } from 'react';
import "../Styles/MyBookings.css"
import Intrestellar from "../assets/Interstellar.jpg"
import DarkKnight from "../assets/The dark knight.webp"
import axios from 'axios';

const MyBookings = () => {
  // Sample booking data (replace with API call)
  const [bookings, setBookings] = useState([
    {
      id: 1,
      movieTitle: 'Interstellar',
      theater: 'City Cinema',
      showtime: '2025-04-28 18:00',
      seats: ['A1', 'A2'],
      poster: Intrestellar,
    },
    {
      id: 2,
      movieTitle: 'The Dark Knight',
      theater: 'Starplex',
      showtime: '2025-04-29 20:00',
      seats: ['B3'],
      poster: DarkKnight,
    },
  ]);

  // Simulate fetching bookings from API

  const token = localStorage.getItem('token')
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, []);
  
  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking.');
    }
  };
  

  

  return (
    <div className="bookings-page">
      <h1 className="bookings-title">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="no-bookings">No bookings found.</p>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <img
                src={booking.poster}
                alt={booking.movieTitle}
                className="booking-poster"
              />
              <div className="booking-info">
                <h2 className="booking-movie-title">{booking.movieTitle}</h2>
                <p className="booking-details">
                  <strong>Theater:</strong> {booking.theater}
                </p>
                <p className="booking-details">
                  <strong>Showtime:</strong> {booking.showtime}
                </p>
                <p className="booking-details">
                  <strong>Seats:</strong> {booking.seats.join(', ')}
                </p>
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="cancel-btn"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;