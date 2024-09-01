import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import editIcon from "../assets/edit.png";
export default function Profile() {
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
    <div className="profile-page-grid">
      <div className="profile-photo">
        <img src={user.profilePhoto} alt="Profile Photo" />
      </div>
      <div className="profile-info">
        <h1 className="profile-username">{user.username}</h1>
        <h2 className="profile-name">
          {" "}
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "User"}
        </h2>
        <h3 className="profile-email">{user.email}</h3>
      </div>
      <button className="edit-profile-icon">EDIT</button>
      <div className="meetings">
        <div className="meeting-heading">
          <h1>Meetings</h1>
          <button>Add Meeting</button>
        </div>
        <ul>
          <li>
            <div>
              <div className="meeting-title">System Design Meeting</div>
              <div className="meeting-date">04/09/2024</div>
              <button className="meeting-join-icon">Join</button>
              <button className="meeting-edit-icon">
                <img src={editIcon} alt="hello" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>

          <li>
            <div>
              <div className="meeting-title">Code refactoring Meeting</div>
              <div className="meeting-date">06/09/2024</div>
              <button className="meeting-join-icon">Join</button>
              <button className="meeting-edit-icon">
                <img src={editIcon} alt="hello" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>

          <li>
            <div>
              <div className="meeting-title">System Design Meeting</div>
              <div className="meeting-date">09/09/2024</div>
              <button className="meeting-join-icon">Join</button>
              <button className="meeting-edit-icon">
                <img src={editIcon} alt="hello" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
