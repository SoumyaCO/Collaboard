import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const callProfilePage = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/profile", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.log(err); //log
      navigate("/Login");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    callProfilePage();
  }, []);

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }
  if (!user) {
    return <div className="profile-container">No user data available</div>;
  }
  return (
    <div className="profile-container">
      <img
        src={user.profilePhoto}
        alt="Profile Photo"
        className="profile-photo"
      />
      <h1 className="username">{user.username}</h1>
      <p className="name">{user.name}</p>
      <p className="email">{user.email}</p>
    </div>
  );
};

export default Profile;
