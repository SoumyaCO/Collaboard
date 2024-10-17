import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import editIcon from "../assets/edit.png";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [meetings, setMeetings] = useState([]);
  const [editingMeetingIndex, setEditingMeetingIndex] = useState(null);
  const [selectedMeetingIndex, setSelectedMeetingIndex] = useState(null);
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    ownerUsername: "",
  });
  const navigate = useNavigate();

  // Fetch user profile
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
      setEditedUser(data);
    } catch (err) {
      navigate("/Login");
    } finally {
      setLoading(false);
    }
  };

  // Fetch meetings
  const fetchMeetings = async () => {
    try {
      const res = await fetch("http://localhost:8080/meeting/getAllMeeting", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await res.json();
      if (Array.isArray(data.data)) {
        setMeetings(data.data);
      } else {
        console.error("Unexpected format:", data);
        setMeetings([]);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setMeetings([]);
    }
  };

  useEffect(() => {
    callProfilePage();
    fetchMeetings();
  }, []);

  // Handle user edit input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  // Save edited user information
  const handleSaveUser = async () => {
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
      setUser(data.data);
      setEditedUser(data.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle meeting edit input changes
  const handleMeetingEditChange = (index, e) => {
    const { name, value } = e.target;
    setMeetings((prev) => {
      const updatedMeetings = [...prev];
      updatedMeetings[index] = { ...updatedMeetings[index], [name]: value };
      return updatedMeetings;
    });
  };

  // Toggle meeting edit mode
  const toggleMeetingEdit = (index) => {
    setEditingMeetingIndex(editingMeetingIndex === index ? null : index);
    handleSelectMeeting(index);
  };

  // Select a meeting
  const handleSelectMeeting = (index) => {
    setSelectedMeetingIndex(selectedMeetingIndex === index ? null : index);
  };

  //  input changes for new meeting
  const handleNewMeetingChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting((prev) => ({ ...prev, [name]: value }));
  };

  //  saving the new meeting
  const handleCreateMeeting = async () => {
    console.log("Saving meeting:", newMeeting);
    console.log(user.username);

    try {
      const res = await fetch("http://localhost:8080/meeting/createMeeting", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newMeeting),
      });

      if (!res.ok) {
        throw new Error("Failed to create meeting");
      }

      // fetch meetings to get the updated list
      await fetchMeetings();
      setIsAddingMeeting(false);

      setNewMeeting({ title: "", date: "", ownerUsername: data.username });
    } catch (err) {
      console.error("Error saving meeting:", err);
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
          <button className="save-profile-icon" onClick={handleSaveUser}>
            SAVE
          </button>
        )}
      </div>
      <div className="meetings">
        <div className="meeting-heading">
          <h1>Meetings</h1>
          <button onClick={() => setIsAddingMeeting(true)}>Add Meeting</button>
        </div>
        <ul>
          {meetings.length > 0 ? (
            meetings.map((meeting, index) => (
              <li
                key={index}
                className={`meeting-item ${
                  selectedMeetingIndex === index ? "selected" : ""
                }`}
              >
                <div onClick={() => handleSelectMeeting(index)}>
                  {editingMeetingIndex === index ? (
                    <>
                      <input
                        type="text"
                        name="title"
                        value={meeting.title}
                        onChange={(e) => handleMeetingEditChange(index, e)}
                      />
                      <input
                        type="date"
                        name="date"
                        value={meeting.date}
                        onChange={(e) => handleMeetingEditChange(index, e)}
                      />
                      <button onClick={() => setEditingMeetingIndex(null)}>
                        SAVE
                      </button>
                      <button onClick={() => setEditingMeetingIndex(null)}>
                        CANCEL
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="meeting-title">{meeting.title}</div>
                      <div className="meeting-date">{meeting.date}</div>
                      <button className="meeting-join-icon">Join</button>
                      <button
                        className="meeting-edit-icon"
                        onClick={() => toggleMeetingEdit(index)}
                      >
                        <img src={editIcon} alt="edit" />
                      </button>
                      <button className="meeting-invite">Invite</button>
                    </>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li>No meetings available</li>
          )}
        </ul>

        {/* Add Meeting Form */}
        {isAddingMeeting && (
          <>
            <div
              className="overlay"
              onClick={() => setIsAddingMeeting(false)}
            ></div>
            <div className="add-meeting-form">
              <h2>Add New Meeting</h2>
              <input
                type="text"
                name="title"
                placeholder="Meeting Title"
                value={newMeeting.title}
                onChange={handleNewMeetingChange}
              />
              <input
                type="date"
                name="date"
                value={newMeeting.date}
                onChange={handleNewMeetingChange}
              />
              <div className="meeting-form-buttons">
                <button onClick={handleCreateMeeting}>SAVE</button>
                <button onClick={() => setIsAddingMeeting(false)}>
                  CANCEL
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
