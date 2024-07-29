import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BannerBackground from "../assets/background_r_img.png";
import axios from "axios";

function HomePage() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate("/HashPage");
  };

  const [roomHash, setRoomHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setRoomHash(e.target.value);
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();

    if (!roomHash) {
      setError("Room link is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("YOUR_ENDPOINT_URL", { hash: roomHash });

      if (response.data.exists) {
        // Navigate to the new room and if any data avalabale  fatch all data 
        //from server logic
      } else {
        setError('Room not found.');
      }
    } catch (err) {
      setError("Error occurred while joining the room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home_contain">
      <Navbar />

      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="Banner Background" />
        </div>
        <div className="text-container">
          <h1 className="primary-heading">
            Work on a Collaborative Whiteboard
          </h1>
          <p className="secondary-text">
            Enhance your teamwork with our interactive and real-time
            collaborative whiteboard.
          </p>
        </div>
        <div className="btn_input_btn">
          <button
            className="New_Room"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
          <input
            type="text"
            placeholder="Enter Link"
            className="Room_link"
            value={roomHash}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="join_btn"
            onClick={handleJoinRoom}
            disabled={loading}
          >
            {loading ? "Joining..." : "Join"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
