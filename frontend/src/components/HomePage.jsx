import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BannerBackground from "../assets/background_r_img.png";
import axios from "axios";
import io from "socket.io-client";

const Server_Url = "https:";
function HomePage() {
  const navigate = useNavigate();
  const [roomHash, setRoomHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = () => {
    navigate("/HashPage");
  };

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
      // Retrieve user information from Session

      const userId = sessionStorage.getItem("userId");
      const username = sessionStorage.getItem("username");
      // First, check if the room exists
      const response = await axios.post("${Server_Url}/check-room", {
        hash: roomHash,
      });

      if (response.data.exists) {
        // Room exists, initialize socket connection
        const socket = io(Server_Url,{autoConnection: false});
        socket.connect();

        // emit room hash and user details
        Socket.emit("JoinRoom", { roomHash, userId, username });
        // Listen for imageData from the server
        socket.on("imagedata", (data) => {
          navigate("/canvas", { state: { imageData: data } });
        });
        socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });
      } else {
        setError("Room not found.");
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
        <div className="btn_input_btn">
          <button className="New_Room" onClick={handleCreateRoom}>
            Create Room
          </button>
          <input
            type="text"
            placeholder="Enter Room Link"
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
        <div className="text-container">
          <h1 className="primary-heading">
            Work on a Collaborative Whiteboard
          </h1>
          <p className="secondary-text">
            Enhance your teamwork with our interactive and real-time
            collaborative whiteboard.
          </p>
        </div>
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="Banner Background" />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
