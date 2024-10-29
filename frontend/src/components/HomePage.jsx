import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import BannerBackground from "../assets/background_r_img.png"
import { socketClient } from "../utils/Socket"
import LoadingSpinner from "./LoadingSpinner"

function HomePage() {
    const location = useLocation()
    const navigate = useNavigate()
    const roomHashRef = useRef("") // ref to store roomHash
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleCreateRoom = () => {
        navigate("/HashPage")
    }

    const handleInputChange = (e) => {
        roomHashRef.current = e.target.value // Update the ref value
    }

    useEffect(() => {
        const meetToken = location.state?.meet_token
        if (meetToken) {
            roomHashRef.current = meetToken // Set the ref value

            const dummyEvent = { preventDefault: () => {} }

            setTimeout(() => {
                handleJoinRoom(dummyEvent)
            }, 200)
        }
    }, [location.state])
    const handleJoinRoom = async (e) => {
        e.preventDefault()
        const roomHash = roomHashRef.current // access the ref value

        if (!roomHash) {
            setError("Room link is required")
            return
        }

        setLoading(true)
        setError("")

        try {
            socketClient.connect()
            sessionStorage.setItem("sessionHash", roomHash)
            socketClient.emit("join-room", { id: roomHash })
        } catch (err) {
            console.error("Error occurred while joining the room:", err)
            setError("Error occurred while joining the room")
            setLoading(false)
        }
    }

    useEffect(() => {
        socketClient.on("event", (message) => {
            socketClient.emit("event", message)
        })

        socketClient.on("permission-from-admin", (message) => {
            console.log("permission-from-admin", message)
            setLoading(false)
            if (message.allow) {
                navigate("/Canvas", {
                    state: { drawingStack: message.drawingStack },
                })
            } else {
                console.log("Permission not granted.")
            }
        })

        socketClient.on("disconnect", () => {
            console.log("socketClient disconnected")
            setLoading(false)
        })

        return () => {
            socketClient.off("event")
            socketClient.off("permission-from-admin")
            socketClient.off("disconnect")
        }
    }, [navigate])

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
                {loading && <LoadingSpinner />}
                <div className="home-bannerImage-container">
                    <img src={BannerBackground} alt="Banner Background" />
                </div>
            </div>
        </div>
    )
}

export default HomePage
