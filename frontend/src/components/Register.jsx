import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login_Register.css";
import axios from "axios";
const Register = () => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/auth/register", {
        username,
        firstName,
        lastName,
        email,
        password,
      })
      .then((r) => {
        if (r.data.message === "user created") {
          alert("Registration successful!");

          navigate("/login");
        } else if (r.data.message === "Email already exists") {
          console.log(r);
          alert("Email already exists. Please use a different email.");
        }
      })
      .catch((e) => {
        alert("Registration failed. Please try again.");
        console.error("Registration error:", e);
      });
  };

  return (
    <div className="login-body">
      <div className="auth-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-field">
            <input
              type="text"
              id="user_name"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="email">User Name:</label>
          </div>
          <div className="input-field">
            <input
              type="text"
              id="First_name"
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <label htmlFor="email">First Name:</label>
          </div>

          <div className="input-field">
            <input
              type="text"
              id="Last_name"
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <label htmlFor="email">Last Name:</label>
          </div>

          <div className="input-field">
            <input
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email:</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password:</label>
          </div>
          <button type="submit">Register</button>
          <div className="register">
            <p>
              Already have an account? <a href="/login">Login here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
