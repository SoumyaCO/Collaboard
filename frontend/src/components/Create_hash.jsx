import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const Server_Url = "http://localhost:8080";
const generateRandomHash = () => {
  const length = 30; // specified length of the hash
  let hash = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  for (let i = 0; i < length; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return hash;
};

const SmallScreenComponent = () => {
  const [hash, setHash] = useState(generateRandomHash());
  const navigate = useNavigate();

  useEffect(() => {
    // retrieve hash from sessionStorage or generate a new one
    const storedHash = sessionStorage.getItem("sessionHash");
    if (storedHash) {
      setHash(storedHash);
    } else {
      const newHash = generateRandomHash();
      setHash(newHash);
      sessionStorage.setItem("sessionHash", newHash);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(hash)
      .then(() => {
        alert("Hash copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy hash: ", err);
      });
  };

  const handleCreateRoom = () => {
    // Retrieve user details from sessionStorage
    // const userId = sessionStorage.getItem("userId");
    // const username = sessionStorage.getItem("username");
    const username = "toukir";

    // initialize socket connection
    const socket = io(Server_Url, {

    const socket = io("http://localhost:8080", {

      autoConnect: false,
      auth: {
        username: "",
      },
    });
    socket.auth.username = username;
    // connect the socket
    socket.connect();

    // emit join request to create a room with hash and user details
    socket.emit("create-room", { id: hash }, (res) => {
      console.log("Room created", res.cb_msg);
      navigate("/canvas");
    });

    // handle socket disconnections
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // navigate("/canvas");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <div style={styles.hashContainer}>
          <input type="text" value={hash} readOnly style={styles.hashInput} />
          <button className="join_btn" onClick={handleCopy}>
            Copy
          </button>
        </div>
        <button className="join_btn" onClick={handleCreateRoom}>
          Join
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000, // appears on top
  },
  popup: {
    backgroundColor: "#D6EFD8",
    borderRadius: "9px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    padding: "20px",
    width: "330px", // width for popup
    height: "250px",
    textAlign: "center",
  },
  hashContainer: {
    marginBottom: "30px",
  },
  hashInput: {
    fontSize: "1em",
    padding: "10px",
    backgroundColor: "#96C9F4",
    textAlign: "center",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%", // Full width of the popup
    boxSizing: "border-box",
  },
};

export default SmallScreenComponent;
