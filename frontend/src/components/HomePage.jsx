import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BannerBackground from "../assets/background_r_img.png";

function HomePage() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate("/HashPage");
  };

  return (
    <div className="home_contain">
      <Navbar />

      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="" />
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
          <button className="New_Room" onClick={handleCreateRoom}>
            Create Room
          </button>
          <input type="text" placeholder="Enter Link" className="Room_link" />
          <button type="submit" className="join_btn">
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
