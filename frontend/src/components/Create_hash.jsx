import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const generateRandomHash = () => {
  const length = 30; // specified length of the hash
  let hash = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return hash;
};

const SmallScreenComponent = () => {
  const [hash, setHash] = useState(generateRandomHash());
  const navigate = useNavigate();

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

  const handleJoin = () => {
    navigate("/canvas");
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
        <button className="join_btn" onClick={handleJoin}>
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
    height:"250px",
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