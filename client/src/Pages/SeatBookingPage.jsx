import React, { useState } from 'react';
import '../Styles/SeatBookingPage.css';
import {  useParams } from 'react-router-dom';
import screenImage from '../assets/Screen.jpg'

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
  const [currentScreen, setCurrentScreen] = useState('Screen 1');
  const [screenBookedSeats] = useState({
    'Screen 1': ['A1', 'B3', 'C5'],
    'Screen 2': ['A2', 'B4', 'D1'],
    'Screen 3': ['C2', 'E3', 'A5'],
  });
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;
  const screens = ['Screen 1', 'Screen 2', 'Screen 3'];
  const params = useParams();
  console.log(params.movie, "Movie");

  const MovieName = params.movie.split("-").join(" ");
  console.log(MovieName);
  const TheaterName = params.theater.split("-").join(" ");

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleScreenSelect = (screen) => {
    setCurrentScreen(screen);
    setSelectedSeats([]); // Reset selected seats when screen changes
  };

  const handleConfirmBooking = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }
    alert(`Seats ${selectedSeats.join(', ')} booked successfully for ${currentScreen}!`);
    
    setSelectedSeats([]);

  };

  return (
    <div className="seat-booking-page">
      <div className="seat-booking-container">
        <h1 className="seat-booking-title">
          You’re booking seats at <span className="theater-title">{TheaterName}</span>🍿Enjoy the show!
        </h1>
        <h2 className="movie-title"><span>{MovieName}</span></h2>
        <div className="screen-selection">
          <h2 className="screen-selection-title">Select Screen</h2>
          <div className="screen-buttons">
            {screens.map((screen) => (
              <button
                key={screen}
                className={`screen-button ${currentScreen === screen ? 'screen-button-active' : ''}`}
                onClick={() => handleScreenSelect(screen)}
              >
                {screen}
              </button>
            ))}
          </div>
        </div>
        <div className="screen-section">
          <h2 className="screen-title">{currentScreen}</h2>
          <img
            className="screen-image"
            src={screenImage}
            alt="Movie Screen"
          />
        </div>
        <div className="seat-grid">
          {rows.map((row) => (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              {[...Array(seatsPerRow)].map((_, index) => {
                const seatNumber = `${row}${index + 1}`;
                return (
                  <Seat
                    key={seatNumber}
                    seatNumber={seatNumber}
                    isSelected={selectedSeats.includes(seatNumber)}
                    isBooked={screenBookedSeats[currentScreen].includes(seatNumber)}
                    onSelect={handleSeatSelect}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="seat-booking-info">
          <h3 className="seat-booking-info-title">
            Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </h3>
          <button className="confirm-button" onClick={handleConfirmBooking}>
            Confirm Booking
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
      </div>
    </div>
  );
};

export default SeatBooking;