import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import editIcon from "../assets/edit.png"
import { makeid } from "../utils/MakeId"
import { showAlert } from "../utils/alert.js"

export default function Profile() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editedUser, setEditedUser] = useState({})
    const [meetings, setMeetings] = useState([])
    const [editingMeetingIndex, setEditingMeetingIndex] = useState(null)
    const [selectedMeetingIndex, setSelectedMeetingIndex] = useState(null)
    const [isAddingMeeting, setIsAddingMeeting] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [newMeeting, setNewMeeting] = useState({
        title: "",
        date: "",
        ownerUsername: "",
        meetingID: "",
    })
    const navigate = useNavigate()

    // Function to format date to 'YYYY-MM-DD'
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${day}-${month}-${year}`
    }

    // Fetch user profile
    const callProfilePage = async () => {
        try {
            const res = await fetch("http://localhost:8080/auth/profile", {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                credentials: "include",
            })

            if (!res.ok) {
                throw new Error("Failed to fetch user profile")
            }
            const data = await res.json()
            setUser(data)
            localStorage.setItem("username", data.username)

            // setOriginalUser(data);
            setEditedUser(data)
        } catch (err) {
            console.error(err)
            navigate("/Login")
        } finally {
            setLoading(false)
        }
    }

    // Fetch meetings
    const fetchMeetings = async () => {
        try {
            const res = await fetch(
                "http://localhost:8080/meeting/getAllMeeting",
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            )

            if (!res.ok) {
                throw new Error("Failed to fetch meetings")
            }

            const data = await res.json()
            if (Array.isArray(data.data)) {
                setMeetings(data.data)
            } else {
                console.error("Unexpected format:", data)
                setMeetings([])
            }
        } catch (err) {
            console.error("Error fetching meetings:", err)
            setMeetings([])
        }
    }

    useEffect(() => {
        callProfilePage()
        fetchMeetings()
    }, [])

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditedUser((prev) => ({ ...prev, [name]: value }))
        setIsEditing(true)
    }
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setIsEditing(true)
        }
    }
    // Save edited user information

    const handleSaveUser = async () => {
        if (!user) return
        const formData = new FormData()
        Object.keys(editedUser).forEach((key) => {
            formData.append(key, editedUser[key])
        })
        if (imageFile) {
            formData.append("avatar", imageFile)
        }

        try {
            const res = await fetch(
                `http://localhost:8080/user/${user.username}`,
                {
                    method: "PUT",
                    body: formData,
                    credentials: "include",
                }
            )

            if (!res.ok) {
                throw new Error("Failed to save user profile")
            }
            const data = await res.json()
            setUser(data.data)
            setEditedUser(data.data)
            showAlert(`${user.username}'s profile edited successfully!`)
            setIsEditing(false)
        } catch (err) {
            showAlert("An error occurred: " + err.message)
        }
    }

    // Handle meeting edit input changes
    const handleMeetingEditChange = (index, e) => {
        const { name, value } = e.target
        setMeetings((prev) => {
            const updatedMeetings = [...prev]
            updatedMeetings[index] = {
                ...updatedMeetings[index],
                [name]: value,
            }
            return updatedMeetings
        })
    }

    // Toggle meeting
    const toggleMeetingEdit = (index) => {
        setEditingMeetingIndex(editingMeetingIndex === index ? null : index)
        handleSelectMeeting(index)
    }

    // Select a meeting
    const handleSelectMeeting = (index) => {
        setSelectedMeetingIndex(selectedMeetingIndex === index ? null : index)
    }

    //  input changes for new meeting
    const handleNewMeetingChange = (e) => {
        const { name, value } = e.target
        setNewMeeting((prev) => ({
            ...prev,
            [name]: value,
            ownerUsername: user.username,
            meetingID: "",
        }))
    }
    // edited meeting
    const handleSaveMeeting = async (meetingID) => {
        const updatedMeeting = meetings.find(
            (meeting) => meeting.meetingID === meetingID
        )
        try {
            const res = await fetch(
                `http://localhost:8080/meeting/updateMeeting/${meetingID}`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(updatedMeeting),
                }
            )

            if (!res.ok) {
                throw new Error("Failed to update meeting")
            }

            await fetchMeetings()
            setEditingMeetingIndex(null)
        } catch (err) {
            console.error("Error in editing meeting:", err)
        }
    }

    // save the new meeting
    const handleCreateMeeting = async () => {
        let meetingID = makeid(10)
        try {
            const res = await fetch(
                "http://localhost:8080/meeting/createMeeting",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ ...newMeeting, meetingID }),
                }
            )

            if (!res.ok) {
                throw new Error("Failed to create meeting")
            }

            await fetchMeetings()
            setIsAddingMeeting(false)
            setNewMeeting({
                title: "",
                date: "",
                ownerUsername: user.username,
                meetingID: "",
            })
        } catch (err) {
            console.error("Error saving meeting:", err)
        }
    }

    if (loading) {
        return <div className="profile-container">Loading...</div>
    }
    if (!user) {
        return <div className="profile-container">No user data available</div>
    }

    const handleDeleteMeeting = async (meetingID) => {
        try {
            const res = await fetch(
                `http://localhost:8080/meeting/deleteMeeting/${meetingID}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            )

            const data = await res.json()
            if (res.ok) {
                fetchMeetings()
                showAlert("Meeting deleted successfully!")
            } else {
                showAlert(
                    data.msg || "An error occurred while deleting the meeting."
                )
            }
        } catch (err) {
            console.error("Error deleting meeting:", err)
            showAlert("An error occurred while deleting the meeting.")
        }
    }

    // for invite meetings
    const handleInviteClick = (meetingLink) => {
        navigator.clipboard
            .writeText(meetingLink)
            .then(() => {
                showAlert("Meeting link copied")
            })
            .catch(showAlert("Failed to copy the meeting link."))
    }

    return (
        <div className="profile-page-grid">
            <div className="profile-photo">
                <img src={imagePreview || user.avatar} alt="Profile Photo" />
                {isEditing && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                )}
            </div>
            <div className="profile-info">
                <h1 className="profile-username">{user.username}</h1>
                <h2 className="profile-name">
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                name="firstName"
                                value={editedUser.firstName || ""}
                                onChange={handleEditChange}
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={editedUser.lastName || ""}
                                onChange={handleEditChange}
                            />
                        </>
                    ) : user.firstName && user.lastName ? (
                        `${user.firstName} ${user.lastName}`
                    ) : (
                        "User"
                    )}
                </h2>
                <h3 className="profile-email">
                    {isEditing ? (
                        <input
                            type="email"
                            name="email"
                            value={editedUser.email || ""}
                            onChange={handleEditChange}
                        />
                    ) : (
                        user.email
                    )}
                </h3>
            </div>
            <div className="profile-buttons">
                <button
                    className="edit-profile-icon"
                    onClick={() => setIsEditing((prev) => !prev)}
                >
                    {isEditing ? "CANCEL" : "EDIT"}
                </button>
                {isEditing && (
                    <button
                        className="save-profile-icon"
                        onClick={handleSaveUser}
                    >
                        SAVE
                    </button>
                )}
            </div>
            <div className="meetings">
                <div className="meeting-heading">
                    <h1>Meetings</h1>
                    <button onClick={() => setIsAddingMeeting(true)}>
                        Add Meeting
                    </button>
                </div>
                <ul>
                    {meetings.length > 0 ? (
                        meetings.map((meeting, index) => (
                            <li
                                key={meeting.meetingID}
                                className={`meeting-item ${
                                    selectedMeetingIndex === index
                                        ? "selected"
                                        : ""
                                }`}
                            >
                                <div onClick={() => handleSelectMeeting(index)}>
                                    {editingMeetingIndex === index ? (
                                        <>
                                            <input
                                                type="text"
                                                name="title"
                                                value={meeting.title}
                                                onChange={(e) =>
                                                    handleMeetingEditChange(
                                                        index,
                                                        e
                                                    )
                                                }
                                            />
                                            <input
                                                type="date"
                                                name="date"
                                                value={meeting.date}
                                                onChange={(e) =>
                                                    handleMeetingEditChange(
                                                        index,
                                                        e
                                                    )
                                                }
                                            />
                                            <button
                                                onClick={() =>
                                                    handleSaveMeeting(
                                                        meeting.meetingID
                                                    )
                                                }
                                                className="edit-action-button save-button"
                                            >
                                                SAVE
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditingMeetingIndex(null)
                                                }
                                                className="edit-action-button cancel-button"
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteMeeting(
                                                        meeting.meetingID
                                                    )
                                                }
                                                className="edit-action-button delete-button"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="meeting-title">
                                                {meeting.title}
                                            </div>
                                            <div className="meeting-date">
                                                {formatDate(meeting.date)}
                                            </div>
                                            <button className="meeting-join-icon">
                                                Join
                                            </button>
                                            <button
                                                className="meeting-edit-icon"
                                                onClick={() =>
                                                    toggleMeetingEdit(index)
                                                }
                                            >
                                                <img
                                                    src={editIcon}
                                                    alt="edit"
                                                />
                                            </button>
                                            <button
                                                className="meeting-invite"
                                                onClick={() =>
                                                    handleInviteClick(
                                                        meeting.link
                                                    )
                                                }
                                            >
                                                Invite
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>No meetings available</li>
                    )}
                </ul>

                {/* Add Meeting Form */}
                {isAddingMeeting && (
                    <>
                        <div
                            className="overlay"
                            onClick={() => setIsAddingMeeting(false)}
                        ></div>
                        <div className="add-meeting-form">
                            <h2>Add New Meeting</h2>
                            <input
                                type="text"
                                name="title"
                                placeholder="Meeting Title"
                                value={newMeeting.title}
                                onChange={handleNewMeetingChange}
                            />
                            <input
                                type="date"
                                name="date"
                                value={newMeeting.date}
                                onChange={handleNewMeetingChange}
                            />
                            <div className="meeting-form-buttons">
                                <button onClick={handleCreateMeeting}>
                                    SAVE
                                </button>
                                <button
                                    onClick={() => setIsAddingMeeting(false)}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
