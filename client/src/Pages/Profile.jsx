import React, { useState, useEffect } from 'react';
import '../Styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import UseApiFetch from '../API-Method/UseApiFetch';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '', mobileNumber: '' });
  const [formData, setFormData] = useState({ name: '', email: '', mobileNumber: '' });
  const [otpData, setOtpData] = useState({ otp: '' });
  const [editingField, setEditingField] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const { responseData, isLoading, serverRequest, apiKey, fetchError } = UseApiFetch();

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
    serverRequest(requestConfig);
  };

  // Fetch recent bookings
  const fetchRecentBookings = () => {
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    const requestConfig = {
      method: 'GET',
      apiUrl: '/api/bookings',
      apiKey: 'GETBOOKINGS',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    serverRequest(requestConfig);
  };

  // Handle user details response
  const handleUserDetailsResponse = () => {
    console.log('User details response:', responseData);
    if (responseData?.success && responseData.data) {
      const { name, email, mobileNumber } = responseData.data;
      const derivedName = name || (email ? email.split('@')[0] : '');
      const derivedMobileNumber = mobileNumber || '1234567890';
      setUser({ name: derivedName, email, mobileNumber: derivedMobileNumber });
      setFormData({ name: derivedName, email, mobileNumber: derivedMobileNumber });
    } else if (responseData?.message) {
      console.error('Error fetching user details:', responseData.message);
      alert(responseData.message);
      if (responseData.message === 'Invalid token' || responseData.message === 'User not found') {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Handle bookings response
  const handleBookingsResponse = () => {
    console.log('Bookings response:', responseData);
    if (responseData?.success && responseData.data) {
      setRecentBookings(Array.isArray(responseData.data) ? responseData.data : []);
    } else if (responseData?.message) {
      console.error('Error fetching bookings:', responseData.message);
      alert(responseData.message);
    }
  };

  // Handle OTP request
  const handleSendOTP = (e) => {
    e.preventDefault();
    const serverRequestParam = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: { email: user.email },
      apiUrl: '/api/auth/send-otp',
      apiKey: 'SEND_OTP',
    };
    serverRequest(serverRequestParam);
  };

  // Handle OTP verification
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const serverRequestParam = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: { email: user.email, otp: otpData.otp },
      apiUrl: '/api/auth/verify-otp',
      apiKey: 'VERIFY_OTP',
    };
    serverRequest(serverRequestParam);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    setOtpData({ ...otpData, [name]: value });
  };

  // Handle edit button click
  const handleEditClick = (field) => {
    setEditingField(field);
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpData({ otp: '' });
  };

  // Handle save button click
  const handleSaveClick = (e, field) => {
    e.preventDefault();
    if (!isOtpVerified) {
      alert('Please verify OTP before saving changes.');
      return;
    }
    const serverRequestParam = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: { [field === 'name' ? 'fullName' : field]: formData[field] },
      apiUrl: '/api/auth/profile',
      apiKey: 'UPDATE_PROFILE',
    };
    serverRequest(serverRequestParam);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch user details and recent bookings on component mount
    fetchUserDetails();
    fetchRecentBookings();
  }, [token, navigate]); // Dependencies ensure this runs once on mount or token change

  // Handle responses from API calls
  useEffect(() => {
    if (!isLoading && apiKey && responseData) {
      switch (apiKey) {
        case 'GETUSER':
          handleUserDetailsResponse();
          break;
        case 'GETBOOKINGS':
          handleBookingsResponse();
          break;
        case 'SEND_OTP':
          if (responseData?.sendOtp) {
            setIsOtpSent(true);
            alert('OTP sent to your email!');
          }
          break;
        case 'VERIFY_OTP':
          if (responseData?.verifyOtp) {
            setIsOtpVerified(true);
            alert('OTP verified successfully!');
          }
          break;
        case 'UPDATE_PROFILE':
          if (responseData) {
            const { fullName, email, mobileNumber } = responseData;
            const derivedName = fullName || (email ? email.split('@')[0] : '');
            const derivedMobileNumber = mobileNumber || '1234567890';
            setUser({ name: derivedName, email, mobileNumber: derivedMobileNumber });
            setFormData({ name: derivedName, email, mobileNumber: derivedMobileNumber });
            setEditingField(null);
            setIsOtpSent(false);
            setIsOtpVerified(false);
            alert('Profile updated successfully!');
          }
          break;
        default:
          break;
      }
    }
  }, [isLoading, apiKey, responseData, fetchError, navigate]); // Dependencies ensure this runs when API response is ready



  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Seat pricing for display in bookings
  const seatPricing = {
    STANDARD: 10,
    PREMIUM: 15,
    VIP: 20,
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>
      <div className="profile-container">
        {/* Profile Info Section */}
        <div className="profile-info">
          <h2 className="section-title">Personal Information</h2>
          {isLoading && apiKey === 'GETUSER' && <p>Loading profile...</p>}
          {editingField === null ? (
            <div className="profile-details">
              <div className="field-group">
                <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
                <button onClick={() => handleEditClick('name')} className="edit-btn">
                  Edit
                </button>
              </div>
              <div className="field-group">
                <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
                <button onClick={() => handleEditClick('email')} className="edit-btn">
                  Edit
                </button>
              </div>
              <div className="field-group">
                <p><strong>Phone:</strong> {user.mobileNumber || 'Not provided'}</p>
                <button onClick={() => handleEditClick('mobileNumber')} className="edit-btn">
                  Edit
                </button>
              </div>
              <div className="profile-actions">
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          ) : !isOtpSent ? (
            <form onSubmit={handleSendOTP} className="profile-form">
              <div className="form-group">
                <label htmlFor="email">Verify your email to update profile:</label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  className="form-input"
                  disabled
                />
              </div>
              {fetchError && apiKey === 'SEND_OTP' && (
                <p className="error-message">{fetchError}</p>
              )}
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={isLoading}>
                  Send OTP
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingField(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : !isOtpVerified ? (
            <form onSubmit={handleVerifyOTP} className="profile-form">
              <div className="form-group">
                <label htmlFor="otp">Enter OTP sent to {user.email}:</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otpData.otp}
                  onChange={handleOtpChange}
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </div>
              {fetchError && apiKey === 'VERIFY_OTP' && (
                <p className="error-message">{fetchError}</p>
              )}
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={isLoading}>
                  Verify OTP
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtpData({ otp: '' });
                    setEditingField(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => handleSaveClick(e, editingField)} className="profile-form">
              <div className="form-group">
                <label htmlFor={editingField}>{editingField.charAt(0).toUpperCase() + editingField.slice(1)}:</label>
                <input
                  type={editingField === 'email' ? 'email' : editingField === 'mobileNumber' ? 'tel' : 'text'}
                  id={editingField}
                  name={editingField}
                  value={formData[editingField]}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={`Enter your ${editingField}`}
                  required={editingField === 'email'}
                />
              </div>
              {fetchError && apiKey === 'UPDATE_PROFILE' && (
                <p className="error-message">{fetchError}</p>
              )}
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={isLoading}>
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditingField(null);
                    setIsOtpSent(false);
                    setIsOtpVerified(false);
                    setOtpData({ otp: '' });
                    setFormData({ ...user });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Bookings Section */}
        <div className="recent-bookings">
          <h2 className="section-title">Recent Bookings</h2>
          {isLoading && apiKey === 'GETBOOKINGS' && <p>Loading bookings...</p>}
          {recentBookings.length === 0 ? (
            <p className="no-bookings">No recent bookings found.</p>
          ) : (
            <div className="bookings-list">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <h3 className="booking-movie-title">{booking.movieTitle}</h3>
                  <p className="booking-details">
                    <strong>Theater:</strong> {booking.theater}
                  </p>
                  <p className="booking-details">
                    <strong>Screen:</strong> {booking.screenNumber}
                  </p>
                  <p className="booking-details">
                    <strong>Showtime:</strong> {new Date(booking.showtime).toLocaleString()}
                  </p>
                  <p className="booking-details">
                    <strong>Seats:</strong>{' '}
                    {booking.seats.map((s) => `${s.seatNumber} (${s.seatType}, $${seatPricing[s.seatType]})`).join(', ')}
                  </p>
                  <p className="booking-details">
                    <strong>Total Price:</strong> ${booking.totalPrice}
                  </p>
                  <p className="booking-details">
                    <strong>Ticket ID:</strong> {booking.ticketId}
                  </p>
                  <p className="booking-details">
                    <strong>Status:</strong> {booking.status}
                  </p>
                </div>
              ))}
            </div>
          )}
          <a href="/bookings" className="view-all-btn">
            View All Bookings
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;