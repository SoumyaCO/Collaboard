import React from "react";
import profile from "../assets/profile_img.png";
import logo from "../assets/logo.png";
import SettingsIcon from "../assets/Settings.png";


const Navbar = () => {
  return (
    <nav>
      <div className="nav-logo-container">
        <img src={logo} alt="Logo" className="Logo" />
      </div>

      <div className="profile_container">
        <div className="setting">
          <img src={SettingsIcon} alt="settings" className="settings_icon" />
        </div>
        <img src={profile} alt="Profile" className="profile_img" />
      </div>
    </nav>
  );
};

export default Navbar;
