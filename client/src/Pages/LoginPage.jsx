import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UseApiFetch from "../API-Method/UseApiFetch";
import { setUser } from "../Redux/Slices/userSlice.js";
import "../Styles/LoginSignUp.css";

const Login = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [reRender, setReRender] = useState(false);
  const { responseData, isLoading, serverRequest, apiKey, fetchError } = UseApiFetch();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    console.log('Login request payload:', obj_loginParams);
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
    console.log('Login response:', responseData);
    console.log(responseData.token)
    console.log(responseData._id,'id')
    if (responseData?.success || responseData?.login) {
      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
        console.log('Token stored:', responseData.token.substring(0, 10) + '...');
        dispatch(setUser({
          user: {
            _id: responseData._id,
            name: responseData.name,
            email: responseData.email,
          },
          token: responseData.token,
        }));
        navigate("/");
      } else {
        console.error('No token or user in response:', responseData);
        setFormErrors({ server: "Login succeeded but no token or user data provided" });
        setReRender(!reRender);
      }
    } else {
      const errorMsg = fetchError || responseData?.message || "Login failed. Please check your credentials.";
      console.error('Login error:', errorMsg);
      setFormErrors({ server: errorMsg });
      setReRender(!reRender);
    }
  };

  useEffect(() => {
    if (!isLoading && apiKey === "LOGIN" && responseData) {
      fnResponseforLogin();
    }
  }, [isLoading, apiKey, responseData, dispatch]);

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
          {formErrors.server && <p className="error-message">{formErrors.server}</p>}
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