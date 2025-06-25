import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UseApiFetch from '../API-Method/UseApiFetch';
import { FaRegEdit, FaSave } from 'react-icons/fa';
import '../Styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoading, errorMessage: fetchError, responseData, apiKey, serverRequest } = UseApiFetch();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [editMode, setEditMode] = useState({
    fullName: false,
    email: false,
    phoneNumber: false,
    password: false,
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    otp: '',
    bookings: '',
  });
  const [otpState, setOtpState] = useState({
    isOtpSent: false,
    otp: '',
    isOtpVerified: false,
  });
  const [otpMessage, setOtpMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);

  // Refs for input fields to focus
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const passwordRef = useRef(null);
  const otpRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const token = localStorage.getItem('token');

  const validateFullName = (name) => {
    if (!name) return 'Full name cannot be empty';
    if (name.length < 2) return 'Full name must be at least 2 characters';
    if (name.length > 50) return 'Full name cannot exceed 50 characters';
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) return 'Full name can only contain letters, spaces, hyphens, or apostrophes';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email cannot be empty';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email is too long';
    return '';
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    const cleanedNumber = phoneNumber.replace(/^\+91\s?-?/, '');
    const phoneRegex = /^[1-9]\d{9}$/;
    if (!phoneRegex.test(cleanedNumber)) return 'Please enter a valid phone number';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password cannot be empty';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Confirm password cannot be empty';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const fetchUserDetails = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    serverRequest({
      method: 'GET',
      apiUrl: '/api/auth/profile',
      apiKey: 'GETUSER',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  const fetchUserBookings = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    serverRequest({
      method: 'GET',
      apiUrl: '/api/bookings/user',
      apiKey: 'GET_BOOKINGS',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  const handleUserDetailsResponse = () => {
    if (responseData?.success && responseData.data) {
      const { name, email, mobileNumber } = responseData.data;
      const derivedFullName = name || (email ? email.split('@')[0] : 'User');
      const derivedPhoneNumber = mobileNumber || '1234567890';
      const newUserData = {
        fullName: derivedFullName,
        email,
        phoneNumber: `+91 ${derivedPhoneNumber}`,
      };
      setUserData(newUserData);
      setFormData({
        ...formData,
        fullName: derivedFullName,
        email,
        phoneNumber: `+91 ${derivedPhoneNumber}`,
      });
    } else {
      const errorMsg = fetchError || responseData?.message || 'Failed to load user data';
      setErrors((prev) => ({ ...prev, email: errorMsg }));
      if (errorMsg.includes('Invalid token') || errorMsg.includes('User not found')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleBookingsResponse = () => {
    if (responseData?.success && responseData.data) {
      setBookings(responseData.data);
      setErrors((prev) => ({ ...prev, bookings: '' }));
    } else {
      const errorMsg = fetchError || responseData?.message || 'Failed to load bookings';
      setErrors((prev) => ({ ...prev, bookings: errorMsg }));
    }
  };

  const handleSendOtp = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    const emailError = validateEmail(userData.email);
    if (!userData.email || emailError) {
      setErrors((prev) => ({
        ...prev,
        otp: emailError || 'Valid email is required to send OTP',
      }));
      setOtpMessage('');
      return;
    }
    serverRequest({
      method: 'POST',
      apiUrl: '/api/auth/send-otp',
      apiKey: 'SENDOTP',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: { email: userData.email },
    });
  };

  const handleVerifyOtp = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!otpState.otp) {
      setErrors((prev) => ({ ...prev, otp: 'OTP is required' }));
      return;
    }
    serverRequest({
      method: 'POST',
      apiUrl: '/api/auth/verify-otp',
      apiKey: 'VERIFYOTP',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: { email: userData.email, otp: otpState.otp },
    });
  };

  const handleSave = (field) => {
    if (!token) {
      navigate('/login');
      return;
    }
    let validationError = '';
    if (field === 'fullName') {
      validationError = validateFullName(formData.fullName);
    } else if (field === 'email') {
      validationError = validateEmail(formData.email);
    } else if (field === 'phoneNumber') {
      validationError = validatePhoneNumber(formData.phoneNumber);
    } else if (field === 'password') {
      validationError = validatePassword(formData.password);
      if (!validationError) {
        const confirmPasswordError = validateConfirmPassword(
          formData.password,
          formData.confirmPassword
        );
        if (confirmPasswordError) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: confirmPasswordError,
          }));
          return;
        }
      }
      if (!otpState.isOtpVerified) {
        setErrors((prev) => ({
          ...prev,
          otp: 'Please verify OTP before saving password',
        }));
        return;
      }
    }

    if (validationError) {
      setErrors((prev) => ({ ...prev, [field]: validationError }));
      return;
    }

    serverRequest({
      method: 'PUT', // Changed to PUT to match backend route
      apiUrl: '/api/auth/update',
      apiKey: 'UPDATEUSER',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        [field === 'phoneNumber' ? 'mobileNumber' : field]:
          field === 'phoneNumber'
            ? formData[field].replace(/^\+91\s?-?/, '')
            : formData[field],
      },
    });
  };

  const toggleEdit = (field) => {
    setEditMode((prev) => ({
      fullName: field === 'fullName' ? !prev.fullName : false,
      email: field === 'email' ? !prev.email : false,
      phoneNumber: field === 'phoneNumber' ? !prev.phoneNumber : false,
      password: field === 'password' ? !prev.password : false,
    }));
    if (editMode[field]) {
      setFormData((prev) => ({
        ...prev,
        [field]: userData[field],
        confirmPassword: '',
      }));
      setErrors((prev) => ({
        ...prev,
        [field]: '',
        confirmPassword: '',
        otp: '',
      }));
      setOtpMessage('');
      if (field === 'password') {
        setOtpState({ isOtpSent: false, otp: '', isOtpVerified: false });
      }
    } else {
      // Focus the corresponding input field
      if (field === 'fullName') fullNameRef.current?.focus();
      else if (field === 'email') emailRef.current?.focus();
      else if (field === 'phoneNumber') {
        if (!userData.phoneNumber) {
          setFormData((prev) => ({ ...prev, phoneNumber: '+91 ' }));
        }
        phoneNumberRef.current?.focus();
      } else if (field === 'password') {
        if (userData.email && !validateEmail(userData.email)) {
          handleSendOtp();
        } else if (!userData.email) {
          setErrors((prev) => ({
            ...prev,
            otp: 'User email not loaded. Please try again.',
          }));
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let validationError = '';
    if (name === 'fullName') {
      validationError = validateFullName(value);
    } else if (name === 'email') {
      validationError = validateEmail(value);
    } else if (name === 'phoneNumber') {
      validationError = validatePhoneNumber(value);
    } else if (name === 'password') {
      validationError = validatePassword(value);
    } else if (name === 'confirmPassword') {
      validationError = validateConfirmPassword(formData.password, value);
    }
    setErrors((prev) => ({ ...prev, [name]: validationError }));

    if (name === 'otp') {
      setOtpState((prev) => ({ ...prev, otp: value }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isSaveDisabled = (field) => {
    if (field === 'fullName' && errors.fullName) return true;
    if (field === 'email' && errors.email) return true;
    if (field === 'phoneNumber' && errors.phoneNumber) return true;
    if (field === 'password') {
      return errors.password || errors.confirmPassword || !otpState.isOtpVerified;
    }
    return false;
  };

  const toggleBookingsDropdown = () => {
    if (!isBookingsOpen) {
      fetchUserBookings();
    }
    setIsBookingsOpen(!isBookingsOpen);
  };

  // Auto-focus OTP and confirmPassword inputs when they appear
  useEffect(() => {
    if (otpState.isOtpSent && !otpState.isOtpVerified) {
      otpRef.current?.focus();
    }
    if (otpState.isOtpVerified && editMode.password) {
      passwordRef.current?.focus();
    }
  }, [otpState.isOtpSent, otpState.isOtpVerified, editMode.password]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserDetails();
  }, [token, navigate]);

  useEffect(() => {
    if (!isLoading && apiKey && (responseData || fetchError)) {
      switch (apiKey) {
        case 'GETUSER':
          handleUserDetailsResponse();
          break;
        case 'GET_BOOKINGS':
          handleBookingsResponse();
          break;
        case 'SENDOTP':
          if (responseData?.sendOtp) {
            setOtpState((prev) => ({
              ...prev,
              isOtpSent: true,
              isOtpVerified: false,
              otp: '',
            }));
            setErrors((prev) => ({ ...prev, otp: '' }));
            setOtpMessage('OTP sent to your email. Check your inbox or spam folder.');
          } else {
            setErrors((prev) => ({
              ...prev,
              otp: fetchError || 'Failed to send OTP. Please try again.',
            }));
            setOtpMessage('');
          }
          break;
        case 'VERIFYOTP':
          if (responseData?.verifyOtp) {
            setOtpState((prev) => ({ ...prev, isOtpVerified: true }));
            setErrors((prev) => ({ ...prev, otp: '' }));
            setOtpMessage('OTP verified successfully.');
          } else {
            setErrors((prev) => ({
              ...prev,
              otp: fetchError || 'Invalid or expired OTP',
            }));
            setOtpMessage('');
          }
          break;
        case 'UPDATEUSER':
          if (responseData?.update && responseData._id) {
            const newUserData = {
              fullName: responseData.fullName,
              email: responseData.email,
              phoneNumber: responseData.mobileNumber
                ? `+91 ${responseData.mobileNumber}`
                : `+91 1234567890`,
            };
            setUserData(newUserData);
            setFormData((prev) => ({
              ...prev,
              ...newUserData,
              password: '',
              confirmPassword: '',
            }));
            setEditMode((prev) => ({
              ...prev,
              [responseData.mobileNumber ? 'phoneNumber' : responseData.field]: false,
            }));
            setErrors((prev) => ({
              ...prev,
              [responseData.mobileNumber ? 'phoneNumber' : responseData.field]: '',
              confirmPassword: '',
              otp: '',
            }));
            setOtpMessage('');
            if (responseData.field === 'password' || responseData.password) {
              setOtpState({ isOtpSent: false, otp: '', isOtpVerified: false });
            }
          } else {
            setErrors((prev) => ({
              ...prev,
              [responseData.mobileNumber ? 'phoneNumber' : responseData.field || 'email']:
                fetchError || responseData?.message || 'Failed to update. Please try again.',
            }));
          }
          break;
      }
    }
  }, [isLoading, apiKey, responseData, fetchError, navigate]);

  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>
      <div className="profile-container">
        <div className="profile-info">
          <h2 className="section-title">Personal Information</h2>
          {isLoading && apiKey === 'GETUSER' && <p>Loading profile...</p>}
          <div className="profile-details">
            <div className="field-group">
              <label className="profile-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className={`profile-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder={isLoading ? 'Loading...' : 'Enter your name'}
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!editMode.fullName}
                ref={fullNameRef}
              />
              {errors.fullName && <p className="error-text">{errors.fullName}</p>}
              <button
                className="btn-edit-profile"
                onClick={() =>
                  editMode.fullName ? handleSave('fullName') : toggleEdit('fullName')
                }
                disabled={editMode.fullName && isSaveDisabled('fullName')}
              >
                {editMode.fullName ? <FaSave /> : <FaRegEdit />}
                {editMode.fullName ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="field-group">
              <label className="profile-label">Email</label>
              <input
                type="email"
                name="email"
                className={`profile-input ${errors.email ? 'input-error' : ''}`}
                placeholder={isLoading ? 'Loading...' : 'Enter your email'}
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editMode.email}
                ref={emailRef}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
              <button
                className="btn-edit-profile"
                onClick={() => (editMode.email ? handleSave('email') : toggleEdit('email'))}
                disabled={editMode.email && isSaveDisabled('email')}
              >
                {editMode.email ? <FaSave /> : <FaRegEdit />}
                {editMode.email ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="field-group">
              <label className="profile-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className={`profile-input ${errors.phoneNumber ? 'input-error' : ''}`}
                placeholder={isLoading ? 'Loading...' : '+91 1234567890'}
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!editMode.phoneNumber}
                ref={phoneNumberRef}
              />
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
              <button
                className="btn-edit-profile"
                onClick={() =>
                  editMode.phoneNumber ? handleSave('phoneNumber') : toggleEdit('phoneNumber')
                }
                disabled={editMode.phoneNumber && isSaveDisabled('phoneNumber')}
              >
                {editMode.phoneNumber ? <FaSave /> : <FaRegEdit />}
                {editMode.phoneNumber ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="field-group">
              <label className="profile-label">Password</label>
              {!otpMessage && (
                <input
                  type="password"
                  name="password"
                  className={`profile-input ${errors.password ? 'input-error' : ''}`}
                  placeholder={isLoading ? 'Loading...' : '********'}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={!editMode.password}
                  ref={passwordRef}
                />
              )}
              {otpMessage && <p className="success-text">{otpMessage}</p>}
              {errors.otp && <p className="error-text">{errors.otp}</p>}
              {otpState.isOtpSent && !otpState.isOtpVerified && (
                <>
                  <input
                    type="text"
                    name="otp"
                    className={`profile-input ${errors.otp ? 'input-error' : ''}`}
                    placeholder="Enter OTP"
                    value={otpState.otp}
                    onChange={handleInputChange}
                    ref={otpRef}
                  />
                  <button className="btn-edit-profile" onClick={handleVerifyOtp}>
                    Verify OTP
                  </button>
                </>
              )}
              {otpState.isOtpVerified && (
                <>
                  <input
                    type="password"
                    name="password"
                    className={`profile-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    ref={passwordRef}
                  />
                  {errors.password && <p className="error-text">{errors.password}</p>}
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`profile-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    ref={confirmPasswordRef}
                  />
                  {errors.confirmPassword && (
                    <p className="error-text">{errors.confirmPassword}</p>
                  )}
                  <button
                    className="btn-edit-profile"
                    onClick={() => handleSave('password')}
                    disabled={isSaveDisabled('password')}
                  >
                    <FaSave />
                    Save
                  </button>
                </>
              )}
              {!otpState.isOtpSent && (
                <button
                  className="btn-edit-profile"
                  onClick={() => toggleEdit('password')}
                >
                  <FaRegEdit />
                  Change
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-info">
          <h2 className="section-title">Your Bookings</h2>
          <button
            className="show-bookings-btn"
            onClick={toggleBookingsDropdown}
          >
            {isBookingsOpen ? 'Hide Bookings' : 'Show Bookings'}
          </button>
          <div className={`bookings-dropdown ${isBookingsOpen ? 'open' : ''}`}>
            {isLoading && apiKey === 'GET_BOOKINGS' && <p>Loading bookings...</p>}
            {errors.bookings && <p className="error-text">{errors.bookings}</p>}
            {bookings.length === 0 && !isLoading && !errors.bookings && (
              <p>No bookings found.</p>
            )}
            {bookings.length > 0 && (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.ticketId} className="booking-card">
                    <h3>{booking.movieName}</h3>
                    <p><strong>Theater:</strong> {booking.theaterName}</p>
                    <p><strong>Screen:</strong> {booking.screenNumber}</p>
                    <p><strong>Showtime:</strong> {new Date(booking.showtime).toLocaleString()}</p>
                    <p><strong>Seats:</strong> {booking.seats.map(s => s.seatNumber).join(', ')}</p>
                    <p><strong>Total Price:</strong> ₹{booking.totalPrice}</p>
                    <p><strong>Ticket ID:</strong> {booking.ticketId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;