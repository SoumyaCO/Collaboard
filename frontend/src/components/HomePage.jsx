import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BannerBackground from "../assets/background_r_img.png";
import axios from "axios";
import io from "socket.io-client";

const Server_Url = "http://localhost:8080";
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

      // const userId = sessionStorage.getItem("userId");
      // const username = sessionStorage.getItem("username");
      const username = "toukir2";
      
      // initialize socket connection
      const socket = io(Server_Url, {
        autoConnect: false,
        auth: {
          username: "",
        },
      });

      socket.connect();

      // emit room hash and user details

      socket.emit("join-room", { id: roomHash }, (response) => {
        if (response) {
          if (response.imgURL) {
            // room exists and image data is received
            const imgURL = response.imgURL;
            navigate("/canvas", { state: { imageURL: imgURL } });
          } else {
            // room exists but no image data is available
            console.log("No image data available");
            navigate("/canvas");
          }
        } else {
          //  room does not exist
          console.log("Room  does not exist ");
          socket.disconnect(); // Disconnect the socket
          setError("Room Not Available");
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
=======
      // First, check if the room exists

      // initialize socket connection
      const socket = io("http://localhost:8080", {
        autoConnect: false,
        auth: {
          username: "",
        },
      });
      if (response.data.exists) {
        // Room exists, initialize socket connection
        const socket = io(Server_Url, { autoConnection: false });
        socket.connect();

        // emit room hash and user details
        socket.emit("join-room", { id: roomHash },(res)=>{
          if(!res.imgURL){
            console.log("no image data ");
            navigate("/canvas");
          }
          else{
            navigate("/canvas", { state: { imageData: data } });
          }
         
        });
        // // Listen for imageData from the server
        // socket.on("imagedata", (data) => {
        //   navigate("/canvas", { state: { imageData: data } });
        // });
        socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });
      } else {
        setError("Room not found.");
      }
    } catch (err) {
      console.error("Error occurred while joining the room:", err);
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
