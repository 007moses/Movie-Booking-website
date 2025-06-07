import React, { useState, useEffect } from 'react';
import '../Styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import UseApiFetch from '../API-Method/UseApiFetch';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: '', phone: '' });
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [otpData, setOtpData] = useState({ otp: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [startInit, setStartInit] = useState(true);

  const { responseData, isLoading, serverRequest, apiKey, fetchError } = UseApiFetch();

  // Sample recent bookings (replace with API call if needed)
  const [recentBookings, setRecentBookings] = useState([
    {
      id: 1,
      movieTitle: 'Interstellar',
      theater: 'City Cinema',
      showtime: '2025-04-28 18:00',
      seats: ['A1', 'A2'],
    },
    {
      id: 2,
      movieTitle: 'The Dark Knight',
      theater: 'Starplex',
      showtime: '2025-04-29 20:00',
      seats: ['B3'],
    },
  ]);

  const token = localStorage.getItem("token");
  console.log(token,"token")
   const fetchUser = () => {
      const serverRequestParam = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        apiUrl: '/api/auth/profile',
        apiKey: 'PROFILE',
      };
      serverRequest(serverRequestParam);
      setStartInit(false)
    };
    console.log(responseData,"Response")
  // Fetch user data on mount
  useEffect(() => {
    if(startInit){
      fetchUser()
    }
  }, [responseData,apiKey,isLoading]);

  // Handle user data response
  useEffect(() => {
    if (!isLoading && apiKey === 'PROFILE' && responseData) {
      setUser(responseData);
      setFormData({ email: responseData.email, phone: responseData.phone });
    }
    if (fetchError && apiKey === 'PROFILE') {
      console.error('Error fetching user:', fetchError);
    }
  }, [isLoading, apiKey, responseData, fetchError]);

  // Handle OTP request
  const handleSendOTP = (e) => {
    e.preventDefault();
    const serverRequestParam = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: { email: user.email },
      apiUrl: '/api/user/send-otp',
      apiKey: 'SEND_OTP',
    };
    serverRequest(serverRequestParam);
  };

  // Handle OTP response
  useEffect(() => {
    if (!isLoading && apiKey === 'SEND_OTP' && responseData) {
      if (responseData.sendOTP) {
        setIsOtpSent(true);
        alert('OTP sent to your email!');
      }
    }
    if (fetchError && apiKey === 'SEND_OTP') {
      console.error('Error sending OTP:', fetchError);
      alert('Failed to send OTP.');
    }
  }, [isLoading, apiKey, responseData, fetchError]);

  // Handle OTP verification
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const serverRequestParam = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: { email: user.email, otp: otpData.otp },
      apiUrl: '/api/user/verify-otp',
      apiKey: 'VERIFY_OTP',
    };
    serverRequest(serverRequestParam);
  };

  // Handle OTP verification response
  useEffect(() => {
    if (!isLoading && apiKey === 'VERIFY_OTP' && responseData) {
      if (responseData.verifyOTP) {
        setIsOtpVerified(true);
        alert('OTP verified successfully!');
      }
    }
    if (fetchError && apiKey === 'VERIFY_OTP') {
      console.error('Error verifying OTP:', fetchError);
      alert('Invalid or expired OTP.');
    }
  }, [isLoading, apiKey, responseData, fetchError]);

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

  // Handle profile update
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const serverRequestParam = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
      apiUrl: '/api/user/profile',
      apiKey: 'UPDATE_PROFILE',
    };
    serverRequest(serverRequestParam);
  };

  // Handle profile update response
  useEffect(() => {
    if (!isLoading && apiKey === 'UPDATE_PROFILE' && responseData) {
      setUser(responseData);
      setIsEditing(false);
      setIsOtpVerified(false);
      setIsOtpSent(false);
      setOtpData({ otp: '' });
      alert('Profile updated successfully!');
    }
    if (fetchError && apiKey === 'UPDATE_PROFILE') {
      console.error('Error updating profile:', fetchError);
      alert('Failed to update profile.');
    }
  }, [isLoading, apiKey, responseData, fetchError]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>
      <div className="profile-container">
        {/* Profile Info Section */}
        <div className="profile-info">
          <h2 className="section-title">Personal Information</h2>
          {!isEditing ? (
            <div className="profile-details">
              <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
              <div className="profile-actions">
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                >
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
                  onClick={() => setIsEditing(false)}
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
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              {fetchError && apiKey === 'UPDATE_PROFILE' && (
                <p className="error-message">{fetchError}</p>
              )}
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={isLoading}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setIsOtpSent(false);
                    setIsOtpVerified(false);
                    setOtpData({ otp: '' });
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
                    <strong>Showtime:</strong> {booking.showtime}
                  </p>
                  <p className="booking-details">
                    <strong>Seats:</strong> {booking.seats.join(', ')}
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
