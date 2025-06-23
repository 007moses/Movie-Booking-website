import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UseApiFetch from '../API-Method/UseApiFetch';
import '../Styles/TicketPage.css';

const TicketPage = () => {
  const { ticketId } = useParams();
  const [booking, setBooking] = useState(null);
  const { isLoading, serverRequest, fetchError, responseData, apiKey } = UseApiFetch();

  useEffect(() => {
    const fetchBooking = () => {
      const requestConfig = {
        method: 'GET',  
        apiUrl: `/api/bookings/${ticketId}`,
        apiKey: 'GETBOOKING',
      };
      serverRequest(requestConfig);
    };
    fetchBooking();
  }, [ticketId]);

  useEffect(() => {
    if (!isLoading && apiKey === 'GETBOOKING' && responseData) {
      setBooking(responseData);
    }
  }, [isLoading, apiKey, responseData]);

  if (isLoading) return <p>Loading ticket...</p>;
  if (fetchError) return <p>Error: {fetchError}</p>;
  if (!booking) return <p>No booking found.</p>;

  return (
    <div className="ticket-page">
      <h1>Ticket Confirmation</h1>
      <div className="ticket-details">
        <p><strong>Ticket ID:</strong> {booking.ticketId}</p>
        <p><strong>Movie:</strong> {booking.movieId.title}</p>
        <p><strong>Theater:</strong> {booking.theaterId.name}</p>
        <p><strong>Screen:</strong> {booking.screen}</p>
        <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
        <p><strong>Showtime:</strong> {new Date(booking.showtime).toLocaleString()}</p>
        <p><strong>User:</strong> {booking.userId.name} ({booking.userId.email})</p>
      </div>
    </div>
  );
};

export default TicketPage;