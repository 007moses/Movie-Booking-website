/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UseApiFetch from '../API-Method/UseApiFetch';
import '../Styles/SeatBooking.css';

const SeatBooking = () => {
  const { movie, theater } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showtime, setShowtime] = useState('');
  const [error, setError] = useState(null);

  const { user, token, isAuthenticated } = useSelector((state) => state.user);
  const { responseData, isLoading, fetchError, serverRequest, apiKey } = UseApiFetch();

  const MovieName = movie;
  const TheaterName = theater;

  useEffect(() => {
    console.log('Redux state:', { user, token, isAuthenticated });
  }, [user, token, isAuthenticated]);

  const theaterData = {
    screenNumber: 1,
    seatLayout: [
      ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
      ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
      ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
    ],
    seatPrices: {
      STANDARD: 100,
      PREMIUM: 250,
      VIP: 500,
    },
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log('User not authenticated, redirecting to /login');
      navigate('/login');
    }
  }, [isAuthenticated, token, navigate]);

  const fetchBookedSeats = () => {
    if (showtime) {
      console.log('Fetching booked seats for showtime:', showtime);
      serverRequest({
        method: 'POST',
        apiUrl: '/api/bookings/seats',
        headers: { 'Content-Type': 'application/json' },
        body: {
          screenNumber: theaterData.screenNumber,
          showtime: showtime || new Date().toISOString(),
        },
        apiKey: 'FETCH_BOOKED_SEATS',
      });
    }
  };

  useEffect(() => {
    if (!isLoading && apiKey === 'FETCH_BOOKED_SEATS') {
      if (fetchError) {
        setError(fetchError);
      } else if (responseData && responseData.success) {
        setBookedSeats(responseData.bookedSeats || []);
      } else {
        setError(responseData?.message || 'Failed to fetch booked seats');
      }
    }
  }, [isLoading, apiKey, responseData, fetchError]);

  useEffect(() => {
    fetchBookedSeats();
  }, [showtime]);

  const toggleSeat = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    try {
      if (!user || !token) {
        console.log('User or token missing, redirecting to /login');
        setError('Please log in to book seats');
        navigate('/login');
        return;
      }

      if (!selectedSeats.length) {
        setError('Please select at least one seat');
        return;
      }

      const seatDetails = selectedSeats.map((seat) => ({
        seatNumber: seat,
        seatType: seat.startsWith('A') ? 'VIP' : seat.startsWith('B') ? 'PREMIUM' : 'STANDARD',
      }));

      const totalPrice = seatDetails.reduce((total, seat) => {
        return total + theaterData.seatPrices[seat.seatType];
      }, 0);

      const bookingData = {
        movieName: MovieName,
        theaterName: TheaterName,
        screenNumber: theaterData.screenNumber,
        showtime: showtime || new Date().toISOString(),
        seats: seatDetails,
        totalPrice,
        user: {
          userId: user._id,
          name: user.name || 'Moses',
          email: user.email || 'guest@example.com',
        },
      };

      console.log('Booking data:', bookingData);

      serverRequest({
        method: 'POST',
        apiUrl: '/api/bookings',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: bookingData,
        apiKey: 'CREATE_BOOKING',
      });
    } catch (err) {
      console.error('Booking error:', err);
      setError('Error creating booking');
    }
  };

  useEffect(() => {
    if (!isLoading && apiKey === 'CREATE_BOOKING') {
      if (fetchError) {
        setError(fetchError);
      } else if (responseData && responseData.success) {
        alert('You booked your ticket successfully');
        navigate(`/ticket/${responseData.data.ticketId}`);
      } else {
        setError(responseData?.message || 'Booking failed: Unknown error');
      }
    }
  }, [isLoading, apiKey, responseData, fetchError, navigate]);

  const handleShowtimeChange = (e) => {
    setShowtime(e.target.value);
    setSelectedSeats([]);
  };

  return (
    <div className="seat-booking-page">
      <h1 className="seat-booking-title">
        Select Seats for {MovieName} at {TheaterName}
      </h1>

      <div className="showtime-selector">
        <label htmlFor="showtime">Select Showtime:</label>
        <select id="showtime" onChange={handleShowtimeChange} value={showtime}>
          <option value="">Select a showtime</option>
          <option value={new Date().toISOString()}>Today, 7:00 PM</option>
          <option value={new Date(Date.now() + 86400000).toISOString()}>
            Tomorrow, 7:00 PM
          </option>
        </select>
      </div>

      {/* {error && <p className="error-message">{error}</p>} */}
      {isLoading && <p>Loading...</p>}

      <div className="seat-map">
        <div className="screen">Screen</div>
        {theaterData.seatLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat) => (
              <div
                key={seat}
                className={`seat ${
                  bookedSeats.includes(seat)
                    ? 'booked'
                    : selectedSeats.includes(seat)
                    ? 'selected'
                    : ''
                }`}
                onClick={() => toggleSeat(seat)}
              >
                {seat}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <span className="seat available"></span> Available
        </div>
        <div className="legend-item">
          <span className="seat selected"></span> Selected
        </div>
        <div className="legend-item">
          <span className="seat booked"></span> Booked
        </div>
      </div>

      <div className="booking-summary">
        <h3>Booking Summary</h3>
        <p>Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
        <p>
          Total Price: ₹
          {selectedSeats
            .reduce((total, seat) => {
              const seatType = seat.startsWith('A')
                ? 'VIP'
                : seat.startsWith('B')
                ? 'PREMIUM'
                : 'STANDARD';
              return total + theaterData.seatPrices[seatType];
            }, 0)
            .toFixed(2)}
        </p>
        <button
          className="book-button"
          onClick={handleBooking}
          disabled={!selectedSeats.length || isLoading}
        >
          {isLoading ? 'Booking...' : 'Book Now'}
        </button>
      </div>
    </div>
  );
};

export default SeatBooking;