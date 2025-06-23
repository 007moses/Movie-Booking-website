import React, { useState, useEffect } from 'react';
import '../Styles/SeatBookingPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import screenImage from '../assets/Screen.jpg';
import UseApiFetch from '../API-Method/UseApiFetch';
import MovieData from '../../../server/Data/Movies.json';
import TheaterData from '../../../server/Data/Theaters.json';

const Seat = ({ seatNumber, isSelected, isBooked, onSelect }) => {
  return (
    <button
      className={`seat ${isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'}`}
      onClick={() => !isBooked && onSelect(seatNumber)}
      disabled={isBooked}
    >
      {seatNumber}
    </button>
  );
};

const SeatBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [user, setUser] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [screenBookedSeats, setScreenBookedSeats] = useState({});
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;
  const params = useParams();
  const navigate = useNavigate();
  const { isLoading, serverRequest, fetchError, responseData, apiKey } = UseApiFetch();

  const MovieName = params.movie.split('-').join(' ');
  const TheaterName = params.theater.split('-').join(' ');
  const movie = MovieData.find((m) => m.title === MovieName);
  const theater = TheaterData.find((t) => t.name === TheaterName);
  const showtimes = theater?.showtimes.filter((s) => s.movieTitle === MovieName) || [];

  // Seat pricing based on type
  const seatPricing = {
    STANDARD: 10,
    PREMIUM: 15,
    VIP: 20,
  };

  // Mock screen data (replace with actual Screen API call if needed)
  const screens = [
    {
      _id: 'screen1',
      screenNumber: 1,
      seatLayout: rows.flatMap((row) =>
        [...Array(seatsPerRow)].map((_, i) => ({
          seatNumber: `${row}${i + 1}`,
          seatType: row === 'A' ? 'VIP' : row === 'B' ? 'PREMIUM' : 'STANDARD',
          isAvailable: true,
        }))
      ),
    },
    {
      _id: 'screen2',
      screenNumber: 2,
      seatLayout: rows.flatMap((row) =>
        [...Array(seatsPerRow)].map((_, i) => ({
          seatNumber: `${row}${i + 1}`,
          seatType: row === 'A' ? 'VIP' : row === 'B' ? 'PREMIUM' : 'STANDARD',
          isAvailable: true,
        }))
      ),
    },
    {
      _id: 'screen3',
      screenNumber: 3,
      seatLayout: rows.flatMap((row) =>
        [...Array(seatsPerRow)].map((_, i) => ({
          seatNumber: `${row}${i + 1}`,
          seatType: row === 'A' ? 'VIP' : row === 'B' ? 'PREMIUM' : 'STANDARD',
          isAvailable: true,
        }))
      ),
    },
  ];

  const token = localStorage.getItem('token');

  // Fetch user details
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUser = () => {
      const requestConfig = {
        method: 'GET',
        apiUrl: '/api/auth/profile',
        apiKey: 'GETUSER',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      serverRequest(requestConfig);
    };
    fetchUser();
  }, [token, navigate, serverRequest]);

  // Fetch booked seats for selected showtime and screen
  useEffect(() => {
    if (selectedShowtime && theater) {
      const fetchBookedSeats = () => {
        const requestConfig = {
          method: 'GET',
          apiUrl: `/api/bookings/seats?theaterId=${theater._id}&screenId=${selectedShowtime.screenId}&startTime=${selectedShowtime.startTime}`,
          apiKey: 'GETBOOKEDSEATS',
        };
        serverRequest(requestConfig, false); // No authentication needed for public endpoint
      };
      fetchBookedSeats();
    }
  }, [selectedShowtime, theater, serverRequest]);

  // Handle API responses
  useEffect(() => {
    if (!isLoading && responseData) {
      if (apiKey === 'GETUSER') {
        const { name, email } = responseData.data;
        const derivedName = name || (email ? email.split('@')[0] : '');
        setUser({ name: derivedName, email });
      } else if (apiKey === 'GETBOOKEDSEATS') {
        setScreenBookedSeats({
          [selectedShowtime.screenId]: responseData.bookedSeats || [],
        });
      } else if (apiKey === 'CREATEBOOKING') {
        setTicketId(responseData.data.ticketId);
        navigate('/ticket', {
          state: {
            ticketId: responseData.data.ticketId,
            movieName: MovieName,
            theaterName: TheaterName,
            screenNumber: selectedShowtime.screenNumber,
            showtime: new Date(selectedShowtime.startTime).toLocaleString(),
            seats: responseData.data.seats.map((s) => `${s.seatNumber} (${s.seatType}, $${seatPricing[s.seatType]})`),
            totalPrice: responseData.data.totalPrice,
            userName: user.name,
            userEmail: user.email,
          },
        });
        setSelectedSeats([]);
      }
    }
    if (fetchError && apiKey !== 'GETUSER') {
      // Suppress GETUSER errors to avoid duplicate alerts
      console.error(`Error for ${apiKey}:`, fetchError);
      alert(`Error: ${fetchError}`);
    }
    if (fetchError && apiKey === 'GETUSER' && (fetchError.includes('Invalid token') || fetchError.includes('User not found'))) {
      console.error('Authentication error:', fetchError);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [isLoading, apiKey, responseData, fetchError, user, MovieName, TheaterName, selectedShowtime, seatPricing, navigate]);

  const handleSeatSelect = (seatNumber, seatType) => {
    setSelectedSeats((prev) => {
      const seat = { seatNumber, seatType };
      const seatIndex = prev.findIndex((s) => s.seatNumber === seatNumber);
      if (seatIndex >= 0) {
        return prev.filter((_, i) => i !== seatIndex);
      }
      return [...prev, seat];
    });
  };

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime({
      startTime: showtime.showDateTime,
      screenId: screens.find((s) => s.screenNumber === showtime.screenNumber)?._id,
      screenNumber: showtime.screenNumber,
    });
    setSelectedSeats([]);
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seatPricing[seat.seatType], 0);
  };

  const handleConfirmBooking = () => {
    if (!user) {
      alert('Please log in to book seats.');
      navigate('/login');
      return;
    }
    if (!selectedShowtime) {
      alert('Please select a showtime.');
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    const bookingData = {
      movieId: movie._id,
      theaterId: theater._id,
      screenId: selectedShowtime.screenId,
      showtime: { startTime: selectedShowtime.startTime },
      seats: selectedSeats,
      totalPrice: calculateTotalPrice(),
    };

    const requestConfig = {
      method: 'POST',
      apiUrl: '/api/bookings',
      apiKey: 'CREATEBOOKING',
      body: bookingData,
    };
    serverRequest(requestConfig);
  };

    const bookingData = {
      movieId: movie._id,
      theaterId: theater._id,
      screenId: selectedShowtime.screenId,
      showtime: { startTime: selectedShowtime.startTime },
      seats: selectedSeats,
      totalPrice: calculateTotalPrice(),
      user: { name: user.name, email: user.email },
    };

    const requestConfig = {
      method: 'POST',
      apiUrl: '/api/bookings',
      apiKey: 'CREATEBOOKING',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: bookingData,
    };

    serverRequest(requestConfig);
  };

  return (
    <div className="seat-booking-page">
      <div className="seat-booking-container">
        <h1 className="seat-booking-title">
          You’re booking seats at <span className="theater-title">{TheaterName}</span>🍿Enjoy the show!
        </h1>
        <h2 className="movie-title"><span>{MovieName}</span></h2>
        {user && <p className="user-info">Booking for: {user.name} ({user.email})</p>}
        {ticketId && <p className="ticket-info">Ticket ID: {ticketId}</p>}
        <div className="showtime-selection">
          <h2 className="showtime-selection-title">Select Showtime</h2>
          <div className="showtime-buttons">
            {showtimes.map((showtime, index) => (
              <button
                key={index}
                className={`showtime-button ${selectedShowtime?.startTime === showtime.showDateTime ? 'showtime-button-active' : ''}`}
                onClick={() => handleShowtimeSelect(showtime)}
              >
                {new Date(showtime.showDateTime).toLocaleString()} (Screen {showtime.screenNumber})
              </button>
            ))}
          </div>
        </div>
        {selectedShowtime && (
          <>
            <div className="screen-section">
              <h2 className="screen-title">Screen {selectedShowtime.screenNumber}</h2>
              <img className="screen-image" src={screenImage} alt="Movie Screen" />
            </div>
            <div className="seat-grid">
              {rows.map((row) => (
                <div key={row} className="seat-row">
                  <span className="row-label">{row}</span>
                  {[...Array(seatsPerRow)].map((_, index) => {
                    const seatNumber = `${row}${index + 1}`;
                    const seat = screens.find((s) => s._id === selectedShowtime.screenId)?.seatLayout.find(
                      (s) => s.seatNumber === seatNumber
                    );
                    if (!seat) return null;
                    return (
                      <Seat
                        key={seatNumber}
                        seatNumber={seatNumber}
                        isSelected={selectedSeats.some((s) => s.seatNumber === seatNumber)}
                        isBooked={screenBookedSeats[selectedShowtime.screenId]?.includes(seatNumber)}
                        onSelect={() => handleSeatSelect(seatNumber, seat.seatType)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="seat-booking-info">
              <h3 className="seat-booking-info-title">
                Selected Seats:{' '}
                {selectedSeats.length > 0
                  ? selectedSeats.map((s) => `${s.seatNumber} (${s.seatType}, $${seatPricing[s.seatType]})`).join(', ')
                  : 'None'}
              </h3>
              <h3 className="total-price">Total Price: ${calculateTotalPrice()}</h3>
              <button className="confirm-button" onClick={handleConfirmBooking} disabled={isLoading}>
                {isLoading && apiKey === 'CREATEBOOKING' ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-box legend-box-available"></div>
                <span className="legend-text">Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-box-selected"></div>
                <span className="legend-text">Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-box-booked"></div>
                <span className="legend-text">Booked</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeatBooking;