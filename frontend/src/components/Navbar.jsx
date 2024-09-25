import React, { useContext, useState, useEffect } from "react";
import profile from "../assets/profile_img.png";
import logo from "../assets/logo.png";
import SettingsIcon from "../assets/Settings.png";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import Cookies from "js-cookie";

const Navbar = () => {
  const { state, dispatch } = useContext(UserContext);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      dispatch({ type: "USER", payload: true });
      fetchUserProfile();
    } else {
      dispatch({ type: "USER", payload: false });
      setUser(null);
    }
  }, [dispatch]); // effect runs when ever dispatch changes
  const fetchUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/getdata", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setUser(data);

      localStorage.setItem("username", data.username);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileClick = () => {
    if (state?.isLoggedIn) {
      setIsDropdownVisible((prev) => !prev);
    } else {
      navigate("/Login");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      dispatch({ type: "USER", payload: false });
      dispatch({ type: "SET_USER", payload: null });
      navigate("/");
    } catch (err) {
      console.error("Logout error: ", err);
    }
  };
  useEffect(() => {
    if (state?.isLoggedIn) {
      fetchUserProfile();
    }
  }, [state?.isLoggedIn]);

  const RenderMenu = () => (
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
          src={state?.isLoggedIn ? user?.avatar : profile}
          alt="Profile"
          className={state?.isLoggedIn ? "profile_Avatar" : "profile_img"}
          onClick={handleProfileClick}
        />
        {isDropdownVisible && state?.isLoggedIn && (
          <div className="profile_dropdown">
            <img
              src={user.avatar}
              alt="Avatar"
              className="dropdown_profile_img"
            />
            <p className="user_id">{user?.username || "user"}</p>
            <button onClick={() => navigate("/Profile")}>Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );

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
