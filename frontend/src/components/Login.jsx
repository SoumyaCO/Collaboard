import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login_Register.css";
import axios from "axios";
import { UserContext } from "../App.jsx";
import { showAlert } from "../utils/alert.js";

const Login = () => {
  const { dispatch } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:8080/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          dispatch({ type: "USER", payload: true });
          showAlert("Login successful!");
          setTimeout(() => {
            navigate("/");
            window.location.reload();
          }, 2000);
        } else {
          showAlert("Login failed: " + response.data.message);
        }
      })
      .catch((error) => {
        showAlert("An error occurred: " + error.message);
      });
  };

  return (
    <div className="login-body">
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-field">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email:</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password:</label>
          </div>
          <div className="forget">
            <label htmlFor="remember">
              <input type="checkbox" id="remember" />
              <p>Remember me</p>
            </label>
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit">Login</button>
          <div className="register">
            <p>
              Don't have an account? <a href="/Register">Register here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
