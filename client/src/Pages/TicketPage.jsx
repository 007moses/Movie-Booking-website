import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../Styles/TicketPage.css';

const TicketPage = () => {
  const location = useLocation();
  const { ticketId, movieName, theaterName, screenNumber, showtime, seats, totalPrice, userName, userEmail } = location.state || {};

  if (!ticketId) {
    return <p>No ticket information available. Please book a ticket first.</p>;
  }

  return (
    <div className="ticket-page">
      <h1>Ticket Confirmation</h1>
      <div className="ticket-details">
        <p><strong>Ticket ID:</strong> {ticketId}</p>
        <p><strong>Movie:</strong> {movieName}</p>
        <p><strong>Theater:</strong> {theaterName}</p>
        <p><strong>Screen:</strong> {screenNumber}</p>
        <p><strong>Seats:</strong> {seats.join(', ')}</p>
        <p><strong>Total Price:</strong> ${totalPrice}</p>
        <p><strong>Showtime:</strong> {showtime}</p>
        <p><strong>User:</strong> {userName} ({userEmail})</p>
      </div>
    </div>
  );
};

export default TicketPage;