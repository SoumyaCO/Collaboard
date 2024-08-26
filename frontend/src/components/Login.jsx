import React, { useState } from "react";
import "../Login_Register.css";
import axios from "axios";
import Cookies from "js-cookie";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/auth/login", {
        email,
        password,
      })
      .then((response) => {
        console.log(response.data);

        if (response.data) {
          Cookies.set("authToken", response.data);
          alert("Login successful! User ID:");
        } else {
          alert("Login failed: ", response);
        }
      })
      .catch((error) => {
        alert("An error occurred: ", error);
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
