import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { socketClient } from "../utils/Socket"
import { makeid } from "../utils/MakeId.js"
import { showAlert } from "../utils/alert.js"
const generateRandomHash = () => makeid(10)

const SmallScreenComponent = () => {
    const [hash, setHash] = useState(generateRandomHash())
    const navigate = useNavigate()

    useEffect(() => {
        // Retrieve hash from sessionStorage or generate a new one
        const storedHash = sessionStorage.getItem("sessionHash")
        if (storedHash) {
            setHash(storedHash)
        } else {
            const newHash = generateRandomHash()
            setHash(newHash)
            sessionStorage.setItem("sessionHash", newHash)
        }
    }, [])

    const handleCopy = () => {
        navigator.clipboard
            .writeText(hash)
            .then(() => {
                showAlert("Hash copied to clipboard!")
            })
            .catch((err) => {
                showAlert("Failed to copy hash: " + err)
            })
    }

    const handleCreateRoom = () => {
        socketClient.connect()

        //create a room with hash
        socketClient.emit("create-room", { id: hash }, (response) => {
            if (response.success) {
                navigate("/Canvas")
            } else {
                console.error("Error creating room:")
            }
        })

        // Handle socketClient disconnections
        socketClient.on("disconnect", () => {
            console.log("socketClient disconnected")
        })

        return () => {
            socketClient.disconnect()
        }
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
                <div style={styles.hashContainer}>
                    <input
                        type="text"
                        value={hash}
                        readOnly
                        style={styles.hashInput}
                    />
                    <button className="join_btn" onClick={handleCopy}>
                        Copy
                    </button>
                </div>
                <button className="join_btn" onClick={handleCreateRoom}>
                    Join
                </button>
            </div>
        </div>
    )
}

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
        width: "330px",
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
}

export default SmallScreenComponent
