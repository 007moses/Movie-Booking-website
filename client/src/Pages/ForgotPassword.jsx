import React, { useEffect, useState } from "react";
import "../Styles/LoginSignUp.css";
import { useNavigate } from "react-router-dom";
import UseApiFetch from "../API-Method/UseApiFetch";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [formErrors, setFormErrors] = useState({});
  const [reRender, setReRender] = useState(false);
  const { responseData, isLoading, serverRequest, apiKey, fetchError } = UseApiFetch();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form inputs
  const validate = () => {
    const emailRegex = /^([^\s@]+@[^\s@]+\.[^\s@]+|[6-9]\d{9})$/;
    let errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Enter a valid email or mobile number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      fnScreenLoadRequestForgotPassword();
    } else {
      console.log("Form validation failed");
    }
  };

  const fnScreenLoadRequestForgotPassword = () => {
    const obj_params = {
      email: formData.email,
    };

    console.log(obj_params);
    const serverRequestParam = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: obj_params,
      apiUrl: "/api/auth/forgot-password",
      apiKey: "FORGOT_PASSWORD",
    };

    serverRequest(serverRequestParam);
  };

  const fnResponseforForgotPassword = () => {
    console.log(responseData);
    if (responseData.success) {
      alert("Password reset link sent successfully!");
      navigate("/login");
    } else {
      setReRender(!reRender);
      setFormErrors({ email: responseData.message || "Failed to send reset link" });
    }
  };

  useEffect(() => {
    if (!isLoading && apiKey === "FORGOT_PASSWORD" && responseData) {
      fnResponseforForgotPassword();
    }
  }, [isLoading, apiKey, responseData]);

  const handleNaviLogin = () => navigate("/login");

  return (
    <div className="auth-page">
      <h1 className="auth-title">Forgot Password</h1>
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address / Phone Number</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="john@gmail.com or 9876543210"
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>
          {fetchError && <p className="error-message">{fetchError}</p>}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
          <div className="text-center">
            <p>
              Back to{" "}
              <span className="signup-link" onClick={handleNaviLogin}>
                Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
