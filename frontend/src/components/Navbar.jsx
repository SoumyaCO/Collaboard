import React, { useContext, useState } from "react";
import profile from "../assets/profile_img.png";
import logo from "../assets/logo.png";
import Avatar from "../assets/profile_avatar/avatar1.jpg";
import SettingsIcon from "../assets/Settings.png";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";

const Navbar = () => {
  const { state, dispatch } = useContext(UserContext);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = state?.isLoggedIn;

  const handleProfileClick = () => {
    if (state) {
      setIsDropdownVisible(!isDropdownVisible);
    } else {
      navigate("/Login");
    }
  };

  const handleLogout = () => {
    // Clear user data or token
    // dispatch({ type: "USER", payload: false });
    // navigate("/");
  };

  const RenderMenu = () => {
    if (state) {
      return (
        <div className="profile_container">
          <div className="setting">
            <img src={SettingsIcon} alt="settings" className="settings_icon" />
          </div>
          <div
            className="profile_wrapper"
            onMouseEnter={() => setIsDropdownVisible(true)}
            onMouseLeave={() => setIsDropdownVisible(false)}
          >
            <img
              src={Avatar}
              alt="Avatar"
              className="profile_Avatar"
              onClick={handleProfileClick}
            />
            {isDropdownVisible && (
              <div className="profile_dropdown">
                <img
                  src={Avatar}
                  alt="Avatar"
                  className="dropdown_profile_img"
                />
                <p className="user_id">UserID123</p>{" "}
                <button onClick={() => navigate("/Profile")}>Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="profile_container">
          <div className="setting">
            <img src={SettingsIcon} alt="settings" className="settings_icon" />
          </div>
          <div
            className="profile_wrapper"
            onMouseEnter={() => setIsDropdownVisible(true)}
            onMouseLeave={() => setIsDropdownVisible(false)}
          >
            <img
              src={profile}
              alt="Profile"
              className="profile_img"
              onClick={handleProfileClick}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <nav>
      <div className="nav-logo-container">
        <img src={logo} alt="Logo" className="Logo" />
      </div>
      <RenderMenu />
    </nav>
  );
};

export default Navbar;
