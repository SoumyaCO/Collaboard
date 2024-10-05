import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import editIcon from "../assets/edit.png";
import { showAlert } from "../utils/alert.js";

export default function Profile() {
  const [user, setUser] = useState(null); //Holds the user profile data retrieved from the backend
  const [originalUser, setOriginalUser] = useState(null); //Stores the original user profile data as it was fetched from the server,
  //is used to keep a reference to the user's profile data before any edits are made
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); //tracks the user is in edit mode or not.
  const [editedUser, setEditedUser] = useState({}); //Holds the user profile data that the user is currently editing
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
      localStorage.setItem("username", data.username);

      setOriginalUser(data);
      setEditedUser(data);
    } catch (err) {
      navigate("/Login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    callProfilePage();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:8080/user/${user.username}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editedUser),
      });

      if (!res.ok) {
        throw new Error("Failed to save user profile");
      }
      const data = await res.json();
      setUser(data.data); // Adjust to handle the structure of response data
      setOriginalUser(data.data);
      setEditedUser(data.data);
      showAlert(user.username + "'s profile edited successfully!");
      setIsEditing(false);
    } catch (err) {
      showAlert("An error occurred: " + err.message);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }
  if (!user) {
    return <div className="profile-container">No user data available</div>;
  }

  return (
    <div className="profile-page-grid">
      <div className="profile-photo">
        <img src={user.avatar} alt="Profile Photo" />
      </div>
      <div className="profile-info">
        <h1 className="profile-username">{user.username}</h1>
        <h2 className="profile-name">
          {isEditing ? (
            <>
              <input
                type="text"
                name="firstName"
                value={editedUser.firstName || ""}
                onChange={handleEditChange}
              />
              <input
                type="text"
                name="lastName"
                value={editedUser.lastName || ""}
                onChange={handleEditChange}
              />
            </>
          ) : user.firstName && user.lastName ? (
            `${user.firstName} ${user.lastName}`
          ) : (
            "User"
          )}
        </h2>
        <h3 className="profile-email">
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editedUser.email || ""}
              onChange={handleEditChange}
            />
          ) : (
            user.email
          )}
        </h3>
      </div>
      <div className="profile-buttons">
        <button
          className="edit-profile-icon"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "CANCEL" : "EDIT"}
        </button>
        {isEditing && (
          <button className="save-profile-icon" onClick={handleSave}>
            SAVE
          </button>
        )}
      </div>
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
                <img src={editIcon} alt="edit" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>
          <li>
            <div>
              <div className="meeting-title">Code Refactoring Meeting</div>
              <div className="meeting-date">06/09/2024</div>
              <button className="meeting-join-icon">Join</button>
              <button className="meeting-edit-icon">
                <img src={editIcon} alt="edit" />
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
                <img src={editIcon} alt="edit" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
