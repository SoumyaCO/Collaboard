import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BannerBackground from "../assets/background_r_img.png";
import { socket } from "./Create_hash";

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
      socket.connect();
      sessionStorage.setItem("sessionHash", roomHash);

      socket.emit("join-room", { id: roomHash });
    } catch (err) {
      console.error("Error occurred while joining the room:", err);
      setError("Error occurred while joining the room");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("event", (message) => {
      socket.emit("event", message);
    });
    socket.on("permission-from-admin", (message) => {
      console.log("permission-from-admin", message);

      if (message.allow) {
        navigate("/Canvas", {
          state: { drawingStack: message.drawingStack },
        });
      } else {
        console.log("Permission not granted.");
      }
    });
    return () => {
      socket.off("event");
      socket.off("permission-from-admin");
    };
  }, [socket]);

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
  return (
    <div className="home_contain">
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
