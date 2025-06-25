/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../Styles/SeatBookingPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import screenImage from '../assets/Screen.jpg';
import UseApiFetch from '../API-Method/UseApiFetch';
import MovieData from '../../../server/Data/Movies.json';
import TheaterData from '../../../server/Data/Theaters.json';

// Seat Component
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

// SeatBooking Component
const SeatBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [user, setUser] = useState(null);
  // const [ticketId, setTicketId] = useState(null);
  const [screenBookedSeats, setScreenBookedSeats] = useState({});
  const [lastFetchedKey, setLastFetchedKey] = useState(null);
  const [startInit, setStartInit] = useState(true);
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;
  const params = useParams();
  const navigate = useNavigate();
  const { isLoading, serverRequest, fetchError, responseData, apiKey } = UseApiFetch();

  const MovieName = params.movie.split('-').join(' ');
  console.log(MovieName,'MovieName')
  const TheaterName = params.theater.split('-').join(' ');
  console.log(TheaterName,'TheaterName')
  const movie = MovieData.find((m) => m.title === MovieName);
  console.log(movie,'movie')
  const theater = TheaterData.find((t) => t.name === TheaterName);
  console.log(theater,'theater')
  const showtimes = theater?.showtimes.filter((s) => s.movieTitle === MovieName) || [];
  console.log(showtimes,'showtimes')

  // Seat pricing based on type 
  const seatPricing = {
    STANDARD: 100,
    PREMIUM: 150,
    VIP: 200,
  };

  const token = localStorage.getItem('token');

  // Fetch user details
  const fetchUserDetails = () => {
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    const requestConfig = {
      method: 'GET',
      apiUrl: '/api/auth/profile',
      apiKey: 'GETUSER',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    console.log('Fetching user details:', JSON.stringify(requestConfig, null, 2));
    serverRequest(requestConfig);
    setStartInit(false);
  };

  // Handle user details response
  const handleUserDetailsResponse = () => {
    console.log('User details response:', responseData, 'Error:', fetchError);
    if (responseData?.success && responseData.data) {
      const { _id, name, email, mobileNumber } = responseData.data;
      const derivedFullName = name || (email ? email.split('@')[0] : 'User');
      const derivedMobileNumber = mobileNumber || '1234567890';
      setUser({
        userId: _id,
        fullName: derivedFullName,
        email,
        mobileNumber: derivedMobileNumber,
      });
    } else {
      const errorMsg = fetchError || responseData?.message || 'Failed to load user data';
      console.error('Error fetching user details:', errorMsg);
      alert(`Error: ${errorMsg}`);
      if (errorMsg.includes('Invalid token') || errorMsg.includes('User not found')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Fetch booked seats for selected showtime and screen
  useEffect(() => {
    if (selectedShowtime && theater) {
      const key = `${TheaterName}-${selectedShowtime.screenNumber}-${selectedShowtime.startTime}`;
      if (key !== lastFetchedKey) {
        const fetchBookedSeats = () => {
          const isValidDate = !isNaN(new Date(selectedShowtime.startTime).getTime());
          if (!isValidDate) {
            console.error('Invalid showtime format:', selectedShowtime.startTime);
            alert('Error: Invalid showtime format. Please select a valid showtime.');
            return;
          }
          const requestConfig = {
            method: 'GET',
            apiUrl: `/api/bookings/seats`,
            apiKey: 'GETBOOKEDSEATS',
            headers: {
              'Content-Type': 'application/json',
            },
          };
          console.log('Fetching booked seats:', JSON.stringify(requestConfig, null, 2));
          serverRequest(requestConfig);
          setLastFetchedKey(key);
        };
        fetchBookedSeats();
      }
    }
  }, [selectedShowtime, theater, serverRequest, lastFetchedKey]);

  // Handle API responses
  useEffect(() => {
    if(startInit){
      fetchUserDetails()
      if (!isLoading && apiKey) {
      switch (apiKey) {
        case 'GETUSER':
          handleUserDetailsResponse();
          break;
        // case 'GETBOOKEDSEATS':
        //   if (responseData?.success && responseData.bookedSeats) {
        //     const key = `${TheaterName}-${selectedShowtime?.screenNumber}-${selectedShowtime?.startTime}`;
        //     setScreenBookedSeats((prev) => ({
        //       ...prev,
        //       [key]: responseData.bookedSeats || [],
        //     }));
        //   } else {
        //     const errorMsg = fetchError || responseData?.message || 'Failed to load booked seats';
        //     console.error('Error fetching booked seats:', errorMsg);
        //     alert(`Error: ${errorMsg}`);
        //   }
        //   break;
        // case 'CREATEBOOKING':
        //   if (responseData?.success && responseData.data) {
        //     setTicketId(responseData.data.ticketId);
        //     alert('You booked your tickets successfully');
        //     navigate('/ticket', {
        //       state: {
        //         ticketId: responseData.data.ticketId,
        //         movieName: MovieName,
        //         theaterName: TheaterName,
        //         screenNumber: selectedShowtime.screenNumber,
        //         showtime: new Date(selectedShowtime.startTime).toLocaleString(),
        //         seats: responseData.data.seats.map((s) => `${s.seatNumber} (${s.seatType}, ₹${seatPricing[s.seatType]})`),
        //         totalPrice: responseData.data.totalPrice,
        //         userName: user?.fullName,
        //         userEmail: user?.email,
        //       },
        //     });
        //     setSelectedSeats([]);
        //   } else {
        //     const errorMsg = fetchError || responseData?.message || 'Failed to create booking';
        //     console.error('Error creating booking:', errorMsg);
        //     alert(`Error: ${errorMsg}`);
        //   }
        //   break;
        // default:
        //   break;
      }
    }
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
      startTime: new Date(showtime.showDateTime).toISOString(),
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
      movieName: MovieName,
      theaterName: TheaterName,
      screenNumber: selectedShowtime.screenNumber,
      showtime: selectedShowtime.startTime,
      seats: selectedSeats,
      totalPrice: calculateTotalPrice(),
      user: {
        userId: user?.userId,
        name: user?.fullName,
        email: user?.email,
      },
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

    console.log('Creating booking:', JSON.stringify(requestConfig, null, 2));
    serverRequest(requestConfig);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Mock screen data
  const screens = [
    {
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

  return (
    <div className="seat-booking-page">
      <div className="seat-booking-container">
        <div className="header">
          <h1 className="seat-booking-title">
            You’re booking seats at <span className="theater-title">{TheaterName}</span>🍿Enjoy the show!
          </h1>
          {user && (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
        <h2 className="movie-title"><span>{MovieName}</span></h2>
        {user && <p className="user-info">Booking for: {user.fullName} ({user.email})</p>}
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
                    const seat = screens.find((s) => s.screenNumber === selectedShowtime.screenNumber)?.seatLayout.find(
                      (s) => s.seatNumber === seatNumber
                    );
                    if (!seat) return null;
                    const key = `${TheaterName}-${selectedShowtime.screenNumber}-${selectedShowtime.startTime}`;
                    return (
                      <Seat
                        key={seatNumber}
                        seatNumber={seatNumber}
                        isSelected={selectedSeats.some((s) => s.seatNumber === seatNumber)}
                        isBooked={screenBookedSeats[key]?.includes(seatNumber)}
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
                  ? selectedSeats.map((s) => `${s.seatNumber} (${s.seatType}, ₹${seatPricing[s.seatType]})`).join(', ')
                  : 'None'}
              </h3>
              <h3 className="total-price">Total Price: ₹{calculateTotalPrice()}</h3>
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