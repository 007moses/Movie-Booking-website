import React, { useState, useEffect } from 'react';
import '../Styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import UseApiFetch from '../API-Method/UseApiFetch';
import {FaRegEdit,FaSave} from 'react-icons/fa'
// import { FaRegEdit, FiSave } from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoading, fetchError, responseData, apiKey, serverRequest } = UseApiFetch();

  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [editMode, setEditMode] = useState({
    fullName: false,
    email: false,
    mobileNumber: false,
    password: false,
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [otpState, setOtpState] = useState({
    isOtpSent: false,
    otp: '',
    isOtpVerified: false,
  });
  const [otpMessage, setOtpMessage] = useState('');

  const token = localStorage.getItem('token');

  // Validation functions (aligned with LoginSecurity)
  const validateFullName = (fullName) => {
    if (!fullName) return 'Full name cannot be empty';
    if (fullName.length < 2) return 'Full name must be at least 2 characters long';
    if (fullName.length > 50) return 'Full name cannot exceed 50 characters';
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(fullName))
      return "Full name can only contain letters, spaces, hyphens, or apostrophes";
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email cannot be empty';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email is too long';
    return '';
  };

  const validateMobileNumber = (mobileNumber) => {
    if (!mobileNumber) return '';
    const cleanedNumber = mobileNumber.replace(/^\+91\s?-?/, '');
    const mobileRegex = /^[1-9]\d{9}$/;
    if (!mobileRegex.test(cleanedNumber)) return 'Please enter a valid mobile number';
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
  };

  // Handle user details response
  const handleUserDetailsResponse = () => {
    console.log('User details response:', responseData, 'Error:', fetchError);
    if (responseData?.success && responseData.data) {
      const { name, email, mobileNumber } = responseData.data;
      const derivedFullName = name || (email ? email.split('@')[0] : 'User');
      const derivedMobileNumber = mobileNumber || '1234567890';
      const newUserData = {
        fullName: derivedFullName,
        email,
        mobileNumber: `+91 ${derivedMobileNumber}`,
      };
      setUserData(newUserData);
      setFormData({
        ...formData,
        fullName: derivedFullName,
        email,
        mobileNumber: `+91 ${derivedMobileNumber}`,
      });
    } else {
      const errorMsg = fetchError || responseData?.message || 'Failed to load user data';
      console.error('Error fetching user details:', errorMsg);
      setErrors((prev) => ({ ...prev, email: errorMsg }));
      if (
        errorMsg.includes('Invalid token') ||
        errorMsg.includes('User not found')
      ) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!token) {
      console.error('No token found, redirecting to login');
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
    const requestConfig = {
      method: 'POST',
      apiUrl: '/api/auth/send-otp',
      apiKey: 'SENDOTP',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: { email: userData.email },
    };
    console.log('Sending OTP request:', JSON.stringify(requestConfig, null, 2));
    try {
      await serverRequest(requestConfig);
    } catch (error) {
      console.error('OTP request error:', error.message);
      setErrors((prev) => ({
        ...prev,
        otp: error.message || 'Request failed. Please check your connection.',
      }));
      setOtpMessage('');
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    if (!otpState.otp) {
      setErrors((prev) => ({ ...prev, otp: 'OTP is required' }));
      return;
    }
    const requestConfig = {
      method: 'POST',
      apiUrl: '/api/auth/verify-otp',
      apiKey: 'VERIFYOTP',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: { email: userData.email, otp: otpState.otp },
    };
    console.log('Verifying OTP request:', JSON.stringify(requestConfig, null, 2));
    try {
      await serverRequest(requestConfig);
    } catch (error) {
      console.error('Verify OTP error:', error.message);
      setErrors((prev) => ({
        ...prev,
        otp: error.message || 'Verification failed. Please try again.',
      }));
      setOtpMessage('');
    }
  };

  // Save updated field
  const handleSave = async (field) => {
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    let validationError = '';
    if (field === 'fullName') {
      validationError = validateFullName(formData.fullName);
    } else if (field === 'email') {
      validationError = validateEmail(formData.email);
    } else if (field === 'mobileNumber') {
      validationError = validateMobileNumber(formData.mobileNumber);
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

    const requestConfig = {
      method: 'POST',
      apiUrl: '/api/auth/user/update',
      apiKey: 'UPDATEUSER',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        [field]:
          field === 'mobileNumber'
            ? formData[field].replace(/^\+91\s?-?/, '')
            : formData[field],
      },
    };
    console.log('Saving field request:', JSON.stringify(requestConfig, null, 2));
    try {
      await serverRequest(requestConfig);
    } catch (error) {
      console.error('Save error:', error.message);
      setErrors((prev) => ({
        ...prev,
        [field]: error.message || 'Update failed. Please try again.',
      }));
    }
  };

  // Toggle edit mode
  const toggleEdit = (field) => {
    setEditMode((prev) => ({
      fullName: field === 'fullName' ? !prev.fullName : false,
      email: field === 'email' ? !prev.email : false,
      mobileNumber: field === 'mobileNumber' ? !prev.mobileNumber : false,
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
    } else if (field === 'mobileNumber' && !userData.mobileNumber) {
      setFormData((prev) => ({ ...prev, mobileNumber: '+91 ' }));
    } else if (
      field === 'password' &&
      userData.email &&
      !validateEmail(userData.email)
    ) {
      handleSendOtp();
    } else if (field === 'password' && !userData.email) {
      setErrors((prev) => ({
        ...prev,
        otp: 'User email not loaded. Please try again.',
      }));
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let validationError = '';
    if (name === 'fullName') {
      validationError = validateFullName(value);
    } else if (name === 'email') {
      validationError = validateEmail(value);
    } else if (name === 'mobileNumber') {
      validationError = validateMobileNumber(value);
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Check if save button is disabled
  const isSaveDisabled = (field) => {
    if (field === 'fullName' && errors.fullName) return true;
    if (field === 'email' && errors.email) return true;
    if (field === 'mobileNumber' && errors.mobileNumber) return true;
    if (field === 'password') {
      return errors.password || errors.confirmPassword || !otpState.isOtpVerified;
    }
    return false;
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserDetails();
  }, [token, navigate]);

  useEffect(() => {
    if (!isLoading && apiKey && (responseData || fetchError)) {
      console.log('useEffect - apiKey:', apiKey, 'responseData:', responseData);
      switch (apiKey) {
        case 'GETUSER':
          handleUserDetailsResponse();
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
            const errorMsg = fetchError || 'Failed to send OTP. Please try again.';
            setErrors((prev) => ({ ...prev, otp: errorMsg }));
            setOtpMessage('');
          }
          break;
        case 'VERIFYOTP':
          if (responseData?.verifyOtp) {
            setOtpState((prev) => ({ ...prev, isOtpVerified: true }));
            setErrors((prev) => ({ ...prev, otp: '' }));
            setOtpMessage('OTP verified successfully.');
          } else {
            const errorMsg = fetchError || 'Invalid or expired OTP';
            setErrors((prev) => ({ ...prev, otp: errorMsg }));
            setOtpMessage('');
          }
          break;
        case 'UPDATEUSER':
          if (responseData?._id) {
            setUserData((prev) => ({
              ...prev,
              fullName: responseData.fullName,
              email: responseData.email,
              mobileNumber: responseData.mobileNumber
                ? `+91 ${responseData.mobileNumber}`
                : `+91 1234567890`,
            }));
            setFormData((prev) => ({
              ...prev,
              fullName: responseData.fullName,
              email: responseData.email,
              mobileNumber: responseData.mobileNumber
                ? `+91 ${responseData.mobileNumber}`
                : `+91 1234567890`,
              password: '',
              confirmPassword: '',
            }));
            setEditMode((prev) => ({ ...prev, [responseData.field]: false }));
            setErrors((prev) => ({
              ...prev,
              [responseData.field]: '',
              confirmPassword: '',
              otp: '',
            }));
            setOtpMessage('');
            if (responseData.field === 'password') {
              setOtpState({ isOtpSent: false, otp: '', isOtpVerified: false });
            }
          } else {
            const errorMsg = fetchError || 'Failed to update. Please try again.';
            setErrors((prev) => ({ ...prev, [responseData.field]: errorMsg }));
          }
          break;
        default:
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
            {/* Full Name */}
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

            {/* Email */}
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

            {/* Mobile Number */}
            <div className="field-group">
              <label className="profile-label">Phone Number</label>
              <input
                type="tel"
                name="mobileNumber"
                className={`profile-input ${errors.mobileNumber ? 'input-error' : ''}`}
                placeholder={isLoading ? 'Loading...' : '+91 1234567890'}
                value={formData.mobileNumber}
                onChange={handleInputChange}
                disabled={!editMode.mobileNumber}
              />
              {errors.mobileNumber && <p className="error-text">{errors.mobileNumber}</p>}
              <button
                className="btn-edit-profile"
                onClick={() =>
                  editMode.mobileNumber ? handleSave('mobileNumber') : toggleEdit('mobileNumber')
                }
                disabled={editMode.mobileNumber && isSaveDisabled('mobileNumber')}
              >
                {editMode.mobileNumber ? <FiSave /> : <FaRegEdit />}
                {editMode.mobileNumber ? 'Save' : 'Edit'}
              </button>
            </div>

            {/* Password */}
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
                  />
                  {errors.password && <p className="error-text">{errors.password}</p>}
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`profile-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {errors.confirmPassword && (
                    <p className="error-text">{errors.confirmPassword}</p>
                  )}
                  <button
                    className="btn-edit-profile"
                    onClick={() => handleSave('password')}
                    disabled={isSaveDisabled('password')}
                  >
                    <FiSave />
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

            {/* Logout */}
            <div className="profile-actions">
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;