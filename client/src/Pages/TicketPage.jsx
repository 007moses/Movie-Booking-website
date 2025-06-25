import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UseApiFetch from '../API-Method/UseApiFetch';
import '../Styles/TicketPage.css';

const TicketPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { responseData, isLoading, fetchError, serverRequest, apiKey } = UseApiFetch();
  const [ticketData, setTicketData] = useState(null);
  const token = localStorage.getItem('token');

  const fetchTicketDetails = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!ticketId) {
      return;
    }
    serverRequest({
      method: 'GET',
      apiUrl: `/api/bookings/${ticketId}`,
      apiKey: 'GET_TICKET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  useEffect(() => {
    if (!isLoading && apiKey === 'GET_TICKET') {
      if (fetchError) {
        setTicketData(null);
        if (fetchError.includes('Invalid token') || fetchError.includes('Booking not found')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } else if (responseData?.success && responseData.data) {
        setTicketData(responseData.data);
      }
    }
  }, [isLoading, responseData, fetchError, apiKey, navigate]);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId, token]);

  const generateTicketPDF = () => {
    if (!ticketData) return;
    const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage{geometry}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{parskip}
\\usepackage{titling}
\\usepackage{xcolor}
\\usepackage{times}
\\geometry{margin=1in}

\\title{Movie Ticket}
\\author{}
\\date{}

\\begin{document}

\\maketitle
\\vspace{-2cm}

\\begin{center}
  \\Huge \\textbf{Movie Ticket}
  \\vspace{0.5cm}
  \\Large \\textbf{${ticketData.movieName.replace(/&/g, '\\&')}}
\\end{center}

\\section*{Ticket Details}
\\begin{description}
  \\item[Ticket ID:] ${ticketData.ticketId}
  \\item[Theater:] ${ticketData.theaterName.replace(/&/g, '\\&')}
  \\item[Screen:] ${ticketData.screenNumber}
  \\item[Showtime:] ${new Date(ticketData.showtime).toLocaleString()}
  \\item[Seats:] ${ticketData.seats.map(s => s.seatNumber).join(', ')}
  \\item[Total Price:] ₹${ticketData.totalPrice}
  \\item[User:] ${ticketData.user.name.replace(/&/g, '\\&')} (${ticketData.user.email})
\\end{description}

\\vspace{1cm}
\\begin{center}
  \\textbf{Thank you for booking with us! Enjoy your movie!}
\\end{center}

\\end{document}
`;
    return latexContent;
  };

  if (isLoading) {
    return <p>Loading ticket details...</p>;
  }

  if (fetchError) {
    return <p className="error-text">{fetchError}</p>;
  }

  if (!ticketData) {
    return <p>No ticket information available. Please book a ticket first.</p>;
  }

  return (
    <div className="ticket-page">
      <h1>Ticket Confirmation</h1>
      <div className="ticket-details">
        <p><strong>Ticket ID:</strong> {ticketData.ticketId}</p>
        <p><strong>Movie:</strong> {ticketData.movieName}</p>
        <p><strong>Theater:</strong> {ticketData.theaterName}</p>
        <p><strong>Screen:</strong> {ticketData.screenNumber}</p>
        <p><strong>Showtime:</strong> {new Date(ticketData.showtime).toLocaleString()}</p>
        <p><strong>Seats:</strong> {ticketData.seats.map(s => s.seatNumber).join(', ')}</p>
        <p><strong>Total Price:</strong> ₹{ticketData.totalPrice}</p>
        <p><strong>User:</strong> {ticketData.user.name} ({ticketData.user.email})</p>
        <button
          className="download-ticket-btn"
          onClick={() => {
            const latexContent = generateTicketPDF();
            window.location.href = `data:application/x-latex,${encodeURIComponent(latexContent)}`;
          }}
        >
          Download Ticket PDF
        </button>
      </div>
    </div>
  );
};

export default TicketPage;