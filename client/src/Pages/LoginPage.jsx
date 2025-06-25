import { useEffect, useState } from "react";
import "../Styles/LoginSignUp.css";
import { useNavigate } from "react-router-dom";
import UseApiFetch from "../API-Method/UseApiFetch";

const Login = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [reRender, setReRender] = useState(false);
  const { responseData, isLoading, serverRequest, apiKey, fetchError } = UseApiFetch();
  const navigate = useNavigate();

  // Handle input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form inputs
  const validate = () => {
    const emailRegex = /^([^\s@]+@[^\s@]+\.[^\s@]+|[6-9]\d{9})$/;
    let errors = {};

    if (!loginData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(loginData.email)) {
      errors.email = "Enter a valid email or mobile number";
    }

    if (!loginData.password) {
      errors.password = "Password is required";
    } else if (loginData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      fnScreenLoadRequestLogin();
    } else {
      console.log("Form validation failed");
    }
  };

  const fnScreenLoadRequestLogin = () => {
    const obj_loginParams = {
      email: loginData?.email,
      password: loginData?.password,
    };

    console.log(obj_loginParams);
    const serverRequestParam = {
      method: "POST",
      headers: {  
        "Content-Type": "application/json",
      },
      body: obj_loginParams,
      apiUrl: "/api/auth/login",
      apiKey: "LOGIN",
    };

    serverRequest(serverRequestParam);
  };

  const fnResponseforLogin = () => {
    console.log(responseData);
    let IsAuth = responseData.login;
    if (IsAuth === true) {
      navigate("/");
      localStorage.setItem("token", responseData.token);
      console.log(responseData.token,"token")
      // console.log(responseData?.token, "UserID");
    } else {
      setReRender(!reRender);
      navigate("/login");
    }
  };

  console.log(localStorage.getItem('token'))

  useEffect(() => {
    if (!isLoading && apiKey === "LOGIN" && responseData) {
      fnResponseforLogin();
    }
  }, [isLoading, apiKey, responseData]);

  const handleNaviSignup = () => navigate("/signup");
  const handleNaviForgotPassword = () => navigate("/forgotpassword");

  return (
    <div className="auth-page">
      <h1 className="auth-title">Login</h1>
      <div className="auth-container">
        <form onSubmit={handleLoginSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address / Phone Number</label>
            <input
              type="text"
              id="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              className="form-input"
              placeholder="john@gmail.com or 9876543210"
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="form-input"
              placeholder="Enter password"
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>
          <div className="text-end">
            <p className="forgot-link" onClick={handleNaviForgotPassword}>
              Forgot password
            </p>
          </div>
          {fetchError && <p className="error-message">{fetchError}</p>}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center">
            <p>
              Don’t have an account?{" "}
              <span className="signup-link" style={{cursor:"pointer"}} onClick={handleNaviSignup}>
                Sign-up
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
