import { useEffect } from "react"
import { InlineLoadingSpinner } from "./LoadingSpinner"
const [newMessagesDot, setnewMessagesDot] = useState(false)

const HamburgerMenu = ({
    menuVisible,
    handleMenuToggle,
    activeTab,
    newMessagesDot,
    handleTabChange,
    users,
    loading,
    currentUserId,
    messages,
    chatInput,
    setChatInput,
    handleSendMessage,
}) => {
    // Effect to handle scrolling when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setnewMessagesDot(true)
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    return (
        <div className="hamburger-container">
            <button className="hamburger-btn" onClick={handleMenuToggle}>
                ☰
                {newMessagesDot && activeTab === "chat" && !menuVisible && (
                    <span className="notification-dot"></span>
                )}
                {newMessagesDot && activeTab === "members" && (
                    <span className="notification-dot"></span>
                )}
            </button>

            <div className={`hamburger-menu ${menuVisible ? "visible" : ""}`}>
                <button className="hamburger-btn" onClick={handleMenuToggle}>
                    ⬅
                    {newMessagesDot && activeTab === "members" && (
                        <span className="notification-dot"></span>
                    )}
                </button>
                <div className="menu-content">
                    <div className="tabs">
                        <button
                            className={`tab ${
                                activeTab === "members" ? "active" : ""
                            }`}
                            onClick={() => handleTabChange("members")}
                        >
                            Members
                        </button>
                        <button
                            className={`tab ${
                                activeTab === "chat" ? "active" : ""
                            }`}
                            onClick={() => handleTabChange("chat")}
                        >
                            Chat
                            {newMessagesDot &&
                                activeTab === "chat" &&
                                !menuVisible && (
                                    <span className="notification-dot"></span>
                                )}
                        </button>
                    </div>

                    {activeTab === "members" && (
                        <div className="members-list">
                            {loading ? (
                                <InlineLoadingSpinner />
                            ) : (
                                users.map((user, index) => (
                                    <div
                                        key={index}
                                        className={`user-item ${
                                            user.isSpeaking ? "speaking" : ""
                                        }`}
                                    >
                                        <img
                                            src={user.dp_url}
                                            className="user-avatar"
                                            alt="User Avatar"
                                        />
                                        <span>{user.full_name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "chat" && (
                        <div className="chat-tab">
                            <div className="messages-container">
                                <div className="messages">
                                    {messages.map((message) => (
                                        <div
                                            key={
                                                message.id || message.timestamp
                                            }
                                            className={`message ${
                                                message.senderId ===
                                                currentUserId
                                                    ? "message-sent"
                                                    : "message-received"
                                            }`}
                                        >
                                            <div className="username">
                                                {message.senderId ===
                                                currentUserId
                                                    ? "You"
                                                    : message.username}
                                            </div>
                                            <div className="message-text">
                                                {message.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) =>
                                        setChatInput(e.target.value)
                                    }
                                    placeholder="Type your message..."
                                />
                                <button onClick={handleSendMessage}>
                                    Send
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HamburgerMenu
