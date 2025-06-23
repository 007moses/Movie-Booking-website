import { useEffect, useState } from "react";
import "../Styles/LoginSignUp.css";
import { useNavigate } from "react-router-dom";
import UseApiFetch from "../API-Method/UseApiFetch";
import { IoEye, IoEyeOff } from 'react-icons/io5';

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { responseData, isLoading, serverRequest, apiKey, fetchError } = UseApiFetch();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "", server: "" }));
  };

  const validate = () => {
    const emailRegex = /^([^\s@]+@[^\s@]+\.[^\s@]+|[6-9]\d{9})$/;
    let errors = {};

    if (!signupData.email) {
      errors.email = "Email or mobile number is required";
    } else if (!emailRegex.test(signupData.email)) {
      errors.email = "Enter a valid email or mobile number";
    }

    if (!signupData.password) {
      errors.password = "Password is required";
    } else if (signupData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!signupData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      fnScreenLoadRequestSignup();
    } else {
      console.log("Form has validation errors");
    }
  };

  const fnScreenLoadRequestSignup = () => {
    const obj_signupParams = {
      email: signupData.email,
      password: signupData.password,
      confirmPassword: signupData.confirmPassword,
    };

    console.log("Payload to be sent:", obj_signupParams);
    const serverRequestParam = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: obj_signupParams,
      apiUrl: "/api/auth/register",
      apiKey: "SIGNUP",
    };

    serverRequest(serverRequestParam);
  };

  const fnResponseforSignup = () => {
    console.log("Signup response:", responseData);
    if (responseData?.register && responseData?.token) {
      localStorage.setItem("token", responseData.token);
      localStorage.setItem("userId", responseData._id);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } else {
      setFormErrors((prev) => ({
        ...prev,
        server: responseData?.message || "Signup failed",
      }));
    }
  };

  useEffect(() => {
    if (!isLoading && apiKey === "SIGNUP") {
      fnResponseforSignup();
    }
  }, [isLoading, apiKey, responseData]);

  const handleNaviLogin = () => navigate("/login");

  return (
    <div className="auth-page">
      <h1 className="auth-title">Sign Up</h1>
      <div className="auth-container">
        <form onSubmit={handleSignupSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address / Phone Number</label>
            <input
              type="text"
              id="email"
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
              className="form-input"
              placeholder="Enter your email or mobile number"
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                className="form-input"
                placeholder="Enter password"
              />
              <span onClick={togglePasswordVisibility} className="toggle-password">
                {passwordVisible ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-container">
              <input
                type={passwordVisible ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                className="form-input"
                placeholder="Confirm password"
              />
              <span onClick={togglePasswordVisibility} className="toggle-password">
                {passwordVisible ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
            {formErrors.confirmPassword && (
              <span className="error-message">{formErrors.confirmPassword}</span>
            )}
          </div>
          {formErrors.server && <p className="error-message">{formErrors.server}</p>}
          {fetchError && <p className="error-message">{fetchError}</p>}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
          <div className="text-center">
            <p>
              Already have an account?{" "}
              <span className="signup-link" style={{ cursor: "pointer" }} onClick={handleNaviLogin}>
                Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;