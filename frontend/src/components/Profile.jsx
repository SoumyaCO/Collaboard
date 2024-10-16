import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import editIcon from "../assets/edit.png";
import { showAlert } from "../utils/alert.js";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [meetingFormVisible, setMeetingFormVisible] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    date: "",
  });
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndMeetings = async () => {
      await callProfilePage();
      await fetchMeetings();
    };

    fetchProfileAndMeetings();
  }, []);

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

      if (!res.ok) throw new Error("Failed to fetch user profile");
      const data = await res.json();
      setUser(data);
      setEditedUser(data);
    } catch (err) {
      navigate("/Login");
    } finally {
      setLoading(false);
    }
  };

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

      if (!res.ok) throw new Error("Failed to fetch meetings");
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMeetings(data.data);
    } catch (err) {
      showAlert("An error occurred while fetching meetings.");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
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

      if (!res.ok) throw new Error("Failed to save user profile");
      const data = await res.json();
      setUser(data.data);
      setEditedUser(data.data);
      showAlert(`${user.username}'s profile edited successfully!`);
      setIsEditingProfile(false);
    } catch (err) {
      showAlert("An error occurred: " + err.message);
    }
  };

  const handleMeetingChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleMeetingSave = async () => {
    try {
      const url = "http://localhost:8080/meeting/createMeeting";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(meetingDetails),
      });

      if (!res.ok) throw new Error("Failed to save meeting");

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMeetings((prev) => [...prev, meetingDetails]);

      showAlert("Meeting created successfully!");
    } catch (err) {
      showAlert("An error occurred: " + err.message);
    } finally {
      setMeetingFormVisible(false);
      setCurrentMeeting(null);
      setMeetingDetails({ title: "", date: "" });
    }
  };

  const MeetingForm = ({ onCancel }) => {
    useEffect(() => {
      if (currentMeeting) {
        setMeetingDetails({
          title: currentMeeting.title,
          date: currentMeeting.date,
        });
      } else {
        setMeetingDetails({ title: "", date: "" });
      }
    }, [currentMeeting]);

    return (
      <div className="meeting-form">
        <h2>{currentMeeting ? "Edit Meeting" : "Create Meeting"}</h2>
        <input
          type="text"
          name="title"
          placeholder="Meeting Title"
          value={meetingDetails.title}
          onChange={handleMeetingChange}
          required
        />
        <input
          type="date"
          name="date"
          value={meetingDetails.date}
          onChange={handleMeetingChange}
          required
        />
        <div className="meeting-form-buttons">
          <button onClick={handleMeetingSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="profile-container">wait Loading...</div>;
  if (!user)
    return <div className="profile-container">No user data available</div>;

  return (
    <div className="profile-page-grid">
      <div className="profile-photo">
        <img src={user.avatar} alt="Profile Photo" />
      </div>
      <div className="profile-info">
        <h1 className="profile-username">{user.username}</h1>
        <h2 className="profile-name">
          {isEditingProfile ? (
            <>
              <input
                type="text"
                name="firstName"
                value={editedUser.firstName || ""}
                onChange={handleEditChange}
                placeholder="First Name"
              />
              <input
                type="text"
                name="lastName"
                value={editedUser.lastName || ""}
                onChange={handleEditChange}
                placeholder="Last Name"
              />
            </>
          ) : user.firstName && user.lastName ? (
            `${user.firstName} ${user.lastName}`
          ) : (
            "User"
          )}
        </h2>
        <h3 className="profile-email">
          {isEditingProfile ? (
            <input
              type="email"
              name="email"
              value={editedUser.email || ""}
              onChange={handleEditChange}
              placeholder="Email"
            />
          ) : (
            user.email
          )}
        </h3>
      </div>
      <div className="profile-buttons">
        <button
          className="edit-profile-icon"
          onClick={() => setIsEditingProfile((prev) => !prev)}
        >
          {isEditingProfile ? "CANCEL" : "EDIT"}
        </button>
        {isEditingProfile && (
          <button className="save-profile-icon" onClick={handleSaveProfile}>
            SAVE
          </button>
        )}
      </div>

      <div className="meetings">
        <div className="meeting-heading">
          <h1>Meetings</h1>
          <button
            onClick={() => {
              setMeetingFormVisible(true);
              setCurrentMeeting(null);
            }}
          >
            Add Meeting
          </button>
        </div>

        {meetingFormVisible && (
          <MeetingForm onCancel={() => setMeetingFormVisible(false)} />
        )}

        <ul>
          {meetings.map((meeting) => (
            <li key={meeting.id}>
              <div>
                <div className="meeting-title">{meeting.title}</div>
                <div className="meeting-date">{meeting.date}</div>
                <button className="meeting-join-icon">Join</button>
                <button
                  className="meeting-edit-icon"
                  onClick={() => {
                    setMeetingFormVisible(true);
                    setCurrentMeeting(meeting);
                  }}
                >
                  <img src={editIcon} alt="edit" />
                </button>
                <button className="meeting-invite">Invite</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
