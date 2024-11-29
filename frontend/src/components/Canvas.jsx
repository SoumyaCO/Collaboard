import { useRef, useState, useCallback, useEffect } from "react"
import Rectangle from "../utils/Rectangle"
import Ellipse from "../utils/Ellipse"
import pen from "../assets/pen.png"
import eraser from "../assets/eraser.png"
import rectangle from "../assets/rectangle.png"
import ellipse from "../assets/ellipse.png"
import edit from "../assets/edit.png"
import { InlineLoadingSpinner } from "./LoadingSpinner"
import { useNavigate } from "react-router-dom"

import { socketClient } from "../utils/Socket"
import { emitDrawing } from "../utils/Socket"
import { useLocation } from "react-router-dom"
const Canvas = () => {
    const canvasRef = useRef(null)
    const location = useLocation()
    const [isDrawing, setIsDrawing] = useState(false)
    const [tool, setTool] = useState("pen")
    const [selectedColor, setSelectedColor] = useState("red")
    const [drawingStack, setDrawingStack] = useState(
        location.state?.drawingStack || []
    )

    const [mouseState, setMouseState] = useState("idle") // idle', 'mousedown', 'mouseup', or 'mousemove'
    const [mouseMoved, setMouseMoved] = useState(false)
    const [loading, setLoading] = useState(false)

    const [selectedId, setSelectedId] = useState(null)
    const [mouseX, setMouseX] = useState(0)
    const [mouseY, setMouseY] = useState(0)
    const [resizeHandle, setResizeHandle] = useState(null)
    const [drawingData, setDrawingData] = useState({
        id: 1,
        tool: "pen",
        color: "red",
        startX: 0,
        startY: 0,
        width: 0,
        height: 0,
        strokeWidth: 2,
    })
    const dotDataRef = useRef({
        tr: null,
        tl: null,
        br: null,
        bl: null,
        tp: null,
        bottom: null,
        left: null,
        right: null,
    })

    const [popupVisible, setPopupVisible] = useState(false)
    const [popupUsername, setPopupUsername] = useState("")
    const [clientID, setClientID] = useState("")
    const [roomID, setRoomID] = useState("")
    const [persistantID, setPersistantID] = useState("")
    const [ishighlight, setIsHighlight] = useState(false)

    const [menuVisible, setMenuVisible] = useState(false)
    const [activeTab, setActiveTab] = useState("members")
    const [messages, setMessages] = useState([])
    const [newMessagesDot, setnewMessagesDot] = useState(false)

    const [chatInput, setChatInput] = useState("")
    const [users, setUsers] = useState([])
    const [currentUserId] = useState(
        localStorage.getItem("username") || "unknown"
    )
    const messagesEndRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const isPageRefreshed = sessionStorage.getItem("isPageRefreshed")

        if (isPageRefreshed) {
            sessionStorage.removeItem("isPageRefreshed")
            navigate("/")
        } else {
            sessionStorage.setItem("isPageRefreshed", "true")
        }

        return () => {
            sessionStorage.removeItem("isPageRefreshed")
        }
    }, [navigate])
    useEffect(() => {
        socketClient.on("draw-on-canvas", (data) => {
            if (data && Array.isArray(data.drawingStack)) {
                setDrawingStack(data.drawingStack)
                drawFromStack(data.drawingStack)
            }
        })

        return () => {
            socketClient.off("draw-on-canvas")
        }
    }, [])
    useEffect(() => {
        socketClient.on("new-joiner-alert", (data) => {
            setPopupUsername(data.username)
            setClientID(data.clientID)
            setRoomID(data.roomID)

            setPopupVisible(true)
        })

        return () => {
            socketClient.off("new-joiner-alert")
            socketClient.off("draw-on-canvas")
        }
    }, [])

    const handlePopupAccept = () => {
        console.log("admin accepted")
        console.log("accept", drawingStack)

        socketClient.emit("permission", {
            clientID: clientID,
            roomID: roomID,
            allow: true,
            message: "welcome friend",
            drawingStack: drawingStack,
        })
        setPopupVisible(false)
    }

    const handlePopupDeny = () => {
        socketClient.emit("permission", {
            clientID: clientID,
            roomID: roomID,
            allow: false,
            message: "get lost",
            drawingStack: [],
        })
        setPopupVisible(false)
    }
    const handleMenuToggle = () => {
        setMenuVisible((prev) => {
            const newVisibleState = !prev
            if (newVisibleState === false) {
                setnewMessagesDot(false)
            }
            return newVisibleState
        })
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        if (tab === "chat") {
            setnewMessagesDot(false)
        } else if (tab === "members") {
            setnewMessagesDot(false)
        }
    }

    useEffect(() => {
        if (activeTab === "members") {
            setLoading(true)

            socketClient.emit("get-all-users", { roomID: roomID })

            const handleUsersList = (data) => {
                console.log("Received users data:", data)

                if (data && Array.isArray(data.members)) {
                    setUsers(data.members)
                } else {
                    console.error("Unexpected data format:", data)
                    setUsers([])
                }
                setLoading(false)
            }

            socketClient.on("on-users-list", handleUsersList)

            return () => {
                socketClient.off("on-users-list", handleUsersList)
            }
        } else {
            setLoading(false)
        }
    }, [activeTab, roomID])
    useEffect(() => {
        if (messages.length > 0) {
            setnewMessagesDot(true)
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        socketClient.on("send-message", (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg])
        })
        return () => {
            socketClient.off("send-message")
        }
    }, [])
    const handleSendMessage = () => {
        let id = sessionStorage.getItem("sessionHash") || roomID
        if (chatInput.trim()) {
            const message = {
                text: chatInput,
                senderId: currentUserId,
                username: currentUserId,
                roomID: id,
            }

            socketClient.emit("chat-message", message)
            setMessages((prevMessages) => [...prevMessages, message])
            setChatInput("")
        }
    }

    const getContext = useCallback(() => {
        // todo need to change name get canvas context
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        return ctx
    }, [])
    const drawFromStack = (stack = []) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        stack.forEach((shape, index) => {
            if (shape.tool === "rect" && shape.isAlive) {
                const rectangle = new Rectangle(
                    [shape.x, shape.y],
                    [shape.width, shape.height],
                    shape.color
                )
                rectangle.drawRectangle(ctx)
            } else if (shape.tool === "ellipse" && shape.isAlive) {
                const ellipse = new Ellipse(
                    [shape.x, shape.y],
                    [shape.width / 2, shape.height / 2],
                    shape.color
                )
                ellipse.drawEllipseFill(ctx)
            }
        })
    }

    function calculateBuffer(width, height, gap) {
        let bufferX = gap
        let bufferY = gap
        if (width < 0) {
            bufferX = -gap
        } else {
            bufferX = gap
        }
        if (height < 0) {
            bufferY = -gap
        } else {
            bufferY = gap
        }
        return [bufferX, bufferY]
    }

    const createDots = (ctx, x, y, width, height) => {
        const radius = 5

        const newDotData = {
            tr: new Path2D(),
            tl: new Path2D(),
            br: new Path2D(),
            bl: new Path2D(),
            tp: new Path2D(),
            bottom: new Path2D(),
            left: new Path2D(),
            right: new Path2D(),
        }

        newDotData.tr.ellipse(
            x + width,
            y,
            radius,
            radius,
            Math.PI / 2,
            0,
            Math.PI * 2
        )
        newDotData.tl.ellipse(x, y, radius, radius, Math.PI / 2, 0, Math.PI * 2)
        newDotData.br.ellipse(
            x + width,
            y + height,
            radius,
            radius,
            Math.PI / 2,
            0,
            Math.PI * 2
        )
        newDotData.bl.ellipse(
            x,
            y + height,
            radius,
            radius,
            Math.PI / 2,
            0,
            Math.PI * 2
        )
        newDotData.tp.ellipse(
            x + width / 2,
            y,
            radius,
            radius,
            Math.PI / 2,
            0,
            Math.PI * 2
        )
        newDotData.bottom.ellipse(
            x + width / 2,
            y + height,
            radius,
            radius,
            Math.PI / 2,
            0,
            Math.PI * 2
        )
        newDotData.left.ellipse(
            x,
            y + height / 2,
            radius,
            radius,
            Math.PI / 2,
            0,
            Math.PI * 2
        )
        newDotData.right.ellipse(
            x + width,
            y + height / 2,
            radius,
            radius,
            Math.PI / 2,
            0,
            Math.PI * 2
        )

        dotDataRef.current = newDotData

        ctx.fillStyle = "#0080ff"
        Object.values(newDotData).forEach((dot) => {
            ctx.fill(dot)
        })

        return newDotData
    }

    const highlight = (ctx, id, stack) => {
        const gap = 10
        ctx.strokeStyle = "#0080ff"
        ctx.lineWidth = 2

        const rect = stack[id]
        const [bufferX, bufferY] = calculateBuffer(rect.width, rect.height, gap)

        const x = rect.x - bufferX
        const y = rect.y - bufferY
        const width = rect.width + bufferX * 2
        const height = rect.height + bufferY * 2

        const s = new Path2D()

        if (rect.tool === "ellipse") {
            s.rect(
                x - rect.width - bufferX,
                y - rect.height - bufferY,
                rect.width * 2 + bufferX * 2,
                rect.height * 2 + bufferY * 2
            )
            createDots(
                ctx,
                x - rect.width - bufferX,
                y - rect.height - bufferY,
                rect.width * 2 + bufferX * 2,
                rect.height * 2 + bufferY * 2
            )
        } else if (rect.tool === "rect") {
            s.rect(x, y, width, height)
            createDots(ctx, x, y, width, height)
        }

        ctx.stroke(s)
    }

    const detectCollision = ({ offsetX, offsetY }, shapes) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i]
            const { x, y, width, height, tool } = shape
            const path = new Path2D()

            if (tool === "rect") {
                path.rect(x, y, width, height)
            } else if (tool === "ellipse") {
                path.ellipse(
                    x + width / 2,
                    y + height / 2,
                    Math.abs(width) / 2,
                    Math.abs(height) / 2,
                    0,
                    0,
                    2 * Math.PI
                )
            }

            if (ctx.isPointInPath(path, offsetX, offsetY)) {
                console.log("id from detectColliction", i)

                return i
            }
        }

        return -1
    }
    const handleCanvasMouseMove = useCallback(
        (event) => {
            const { offsetX, offsetY } = event
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")
            let cursor = "auto"

            // ctx.clearRect(0, 0, canvas.width, canvas.height)
            // drawFromStack(drawingStack)

            let hoveredDotPositions = dotDataRef.current
            console.log(dotDataRef.current)

            Object.keys(hoveredDotPositions).forEach((dotKey) => {
                const dotPath = hoveredDotPositions[dotKey]
                console.log(hoveredDotPositions[dotKey])

                if (ctx.isPointInPath(dotPath, offsetX, offsetY)) {
                    if (dotKey === "tl" || dotKey === "br") {
                        cursor = "nwse-resize"
                    } else if (dotKey === "tr" || dotKey === "bl") {
                        cursor = "nesw-resize"
                    } else if (dotKey === "left" || dotKey === "right") {
                        cursor = "ew-resize"
                    } else {
                        cursor = "ns-resize"
                    }
                }
            })

            canvas.style.cursor = cursor
        },
        [drawingStack]
    )

    const handleMouseDown = useCallback(
        (event) => {
            const ctx = getContext()
            const { offsetX, offsetY } = event
            const id = detectCollision({ offsetX, offsetY }, drawingStack)

            setMouseState("mousedown")
            let MouseDownDotPositions = null

            if (tool === "edit" && id !== -1) {
                setPersistantID(id)
                setSelectedId(id)
                setIsDrawing(true)
                setIsHighlight(true)
                setMouseX(offsetX)
                setMouseY(offsetY)
                highlight(ctx, persistantID, drawingStack)
                MouseDownDotPositions = dotDataRef.current
            } else if (tool === "eraser" && id !== -1) {
                setPersistantID(null)
                setIsHighlight(false)
                const updatedStack = drawingStack.filter(
                    (_, index) => index !== id
                )
                setDrawingStack(updatedStack)
                drawFromStack(updatedStack)
                emitDrawing(socketClient, {
                    drawingStack: updatedStack,
                    message: "hi",
                })
            } else if (tool === "rect" || tool === "ellipse") {
                setIsDrawing(true)
                setMouseMoved(true)
                setDrawingData((prevData) => ({
                    ...prevData,
                    startX: offsetX,
                    startY: offsetY,
                    color: selectedColor,
                    tool: tool,
                }))
            }

            let resizeDetected = false
            if (ishighlight && tool === "edit") {
                Object.keys(MouseDownDotPositions).forEach((dotKey) => {
                    const dotPath = MouseDownDotPositions[dotKey]
                    if (ctx.isPointInPath(dotPath, offsetX, offsetY)) {
                        setResizeHandle(dotKey)
                        resizeDetected = true
                    }
                })
            }

            if (!resizeDetected) {
                setResizeHandle(null)
            }
        },
        [drawingStack, tool]
    )

    const handleMouseUp = useCallback(
        (event) => {
            if (mouseState !== "mousedown") return
            setMouseState("mouseup")
            setMouseMoved(false)
            if (!isDrawing) return
            if (!mouseMoved) {
                // If mouse didn't move, reset drawing
                setIsDrawing(false)
                setMouseState("idle")

                canvasRef.current.style.cursor = "auto"
                return
            }

            // if (tool === "edit" && ishighlight&& mouseMoved) {
            //     highlight(ctx, persistantID, drawingStack)
            // }

            const ctx = getContext()
            const { offsetX, offsetY } = event
            const width = offsetX - drawingData.startX
            const height = offsetY - drawingData.startY

            let updatedStack

            if (tool === "rect") {
                if (width === 0 || height === 0) return

                let rect = new Rectangle(
                    [drawingData.startX, drawingData.startY],
                    [width, height],
                    drawingData.color
                )

                updatedStack =
                    tool === "edit" && selectedId !== null
                        ? drawingStack.map((r, index) => {
                              if (index === selectedId) {
                                  return {
                                      ...r,
                                      x: drawingData.startX,
                                      y: drawingData.startY,
                                      width: width,
                                      height: height,
                                      color: drawingData.color,
                                  }
                              }
                              return r
                          })
                        : [
                              ...drawingStack,
                              {
                                  id: drawingData.id,
                                  tool: drawingData.tool,
                                  color: drawingData.color,
                                  x: drawingData.startX,
                                  y: drawingData.startY,
                                  width: width,
                                  height: height,
                                  strokeWidth: drawingData.strokeWidth,
                                  isAlive: true,
                                  version: 1,
                              },
                          ]

                setDrawingStack(updatedStack)
                drawFromStack(updatedStack)
                setDrawingData((prev) => ({ ...prev, id: prev.id + 1 }))
            } else if (tool === "ellipse") {
                if (width === 0 || height === 0) return

                let ellipse = new Ellipse(
                    [drawingData.startX, drawingData.startY],
                    [width / 2, height / 2],
                    drawingData.color
                )

                updatedStack =
                    tool === "edit" && selectedId !== null
                        ? drawingStack.map((e, index) => {
                              if (index === selectedId) {
                                  return {
                                      ...e,
                                      x: drawingData.startX,
                                      y: drawingData.startY,
                                      width: width,
                                      height: height,
                                      color: drawingData.color,
                                  }
                              }
                              return e
                          })
                        : [
                              ...drawingStack,
                              {
                                  id: drawingData.id,
                                  tool: drawingData.tool,
                                  color: drawingData.color,
                                  x: drawingData.startX,
                                  y: drawingData.startY,
                                  width: width,
                                  height: height,
                                  strokeWidth: drawingData.strokeWidth,
                                  isAlive: true,
                                  version: 1,
                              },
                          ]

                setDrawingStack(updatedStack)
                drawFromStack(updatedStack)
                setDrawingData((prev) => ({ ...prev, id: prev.id + 1 }))
            }

            setIsDrawing(false)
            setSelectedId(null)
            setResizeHandle(null)

            emitDrawing(socketClient, {
                drawingStack: updatedStack,
                message: "hi",
            })
            canvasRef.current.style.cursor = "auto"
        },
        [
            isDrawing,
            mouseMoved,
            drawingData,
            tool,
            getContext,
            drawingStack,
            selectedId,
            mouseState,
        ]
    )
    const handleMouseMove = useCallback(
        (event) => {
            const { offsetX, offsetY } = event
            const canvas = canvasRef.current
            const ctx = getContext()
            if (tool === "edit" && persistantID !== null && ishighlight) {
                handleCanvasMouseMove(event)
            }
            if (tool === "edit" && !ishighlight) {
                setPersistantID(null)
            }
            if (mouseState === "mousedown") {
                if (tool === "edit" && persistantID !== null) {
                    console.log(persistantID)

                    if (ishighlight) {
                        highlight(ctx, persistantID, drawingStack)
                    }
                    const rect = drawingStack[persistantID]
                    let updatedStack = [...drawingStack]
                    let updatedRect = { ...rect }

                    if (resizeHandle) {
                        // Resize logic (adjusting shape size when dragging handle)
                        const gap = 7
                        switch (resizeHandle) {
                            case "bottom-right":
                                updatedRect.width = offsetX - rect.x + gap
                                updatedRect.height = offsetY - rect.y + gap
                                break
                            case "top-left":
                                updatedRect.width =
                                    rect.width + (rect.x - offsetX) + gap
                                updatedRect.height =
                                    rect.height + (rect.y - offsetY) + gap
                                updatedRect.x = offsetX
                                updatedRect.y = offsetY
                                break
                            case "top-right":
                                updatedRect.width = offsetX - rect.x + gap
                                updatedRect.height =
                                    rect.height + (rect.y - offsetY) + gap
                                updatedRect.y = offsetY
                                break
                            case "bottom-left":
                                updatedRect.width =
                                    rect.width + (rect.x - offsetX) + gap
                                updatedRect.height = offsetY - rect.y + gap
                                updatedRect.x = offsetX
                                break
                            case "top":
                                updatedRect.height =
                                    rect.height + (rect.y - offsetY) + gap
                                updatedRect.y = offsetY
                                break
                            case "bottom":
                                updatedRect.height = offsetY - rect.y + gap
                                break
                            case "left":
                                updatedRect.width =
                                    rect.width + (rect.x - offsetX) + gap
                                updatedRect.x = offsetX
                                break
                            case "right":
                                updatedRect.width = offsetX - rect.x + gap
                                break
                            default:
                                break
                        }

                        updatedStack[persistantID] = updatedRect
                        setDrawingStack(updatedStack)
                        drawFromStack(updatedStack)
                        highlight(ctx, persistantID, drawingStack)
                    } else {
                        // Handle moving the rectangle
                        updatedRect.x += offsetX - mouseX
                        updatedRect.y += offsetY - mouseY
                        updatedStack[persistantID] = updatedRect
                        setDrawingStack(updatedStack)
                        setMouseX(offsetX)
                        setMouseY(offsetY)
                        drawFromStack(updatedStack)
                        highlight(ctx, persistantID, drawingStack)
                    }
                } else if (tool === "rect" || tool === "ellipse") {
                    // Handle shape preview (during mouse move)
                    const width = offsetX - drawingData.startX
                    const height = offsetY - drawingData.startY

                    setDrawingData((prevData) => ({
                        ...prevData,
                        width,
                        height,
                    }))

                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    drawFromStack(drawingStack)

                    ctx.strokeStyle = "rgba(0, 120, 215, 0.3)"
                    ctx.fillStyle = "rgba(0, 120, 215, 0.3)"
                    ctx.lineWidth = 1

                    if (tool === "rect") {
                        ctx.strokeRect(
                            drawingData.startX,
                            drawingData.startY,
                            width,
                            height
                        )
                    } else if (tool === "ellipse") {
                        ctx.beginPath()
                        ctx.ellipse(
                            drawingData.startX + width / 2,
                            drawingData.startY + height / 2,
                            Math.abs(width) / 2,
                            Math.abs(height) / 2,
                            0,
                            0,
                            Math.PI * 2
                        )
                        ctx.stroke()
                        ctx.fill()
                    }
                }

                emitDrawing(socketClient, {
                    drawingStack: drawingStack,
                    message: "hi",
                })
            }
        },
        [
            mouseState,
            drawingData,
            tool,
            getContext,
            drawingStack,
            selectedId,
            mouseX,
            mouseY,
            resizeHandle,
            handleCanvasMouseMove,
        ]
    )

    useEffect(() => {
        drawFromStack(drawingStack)
    }, [drawingStack])

    useEffect(() => {
        const canvas = canvasRef.current
        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mouseup", handleMouseUp)
        canvas.addEventListener("mouseout", () => {
            setIsDrawing(false)
            setMouseState("idle")
        })

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown)
            canvas.removeEventListener("mousemove", handleMouseMove)
            canvas.removeEventListener("mouseup", handleMouseUp)
            canvas.removeEventListener("mouseout", () => {
                setIsDrawing(false)
                setMouseState("idle")
            })
        }
    }, [handleMouseDown, handleMouseMove, handleMouseUp])

    const selectTool = (newTool) => {
        setTool(newTool)
        setDrawingData((prev) => ({ ...prev, tool: newTool }))
    }

    const colors = ["red", "blue", "green", "yellow", "black"]

    return (
        <div className="app">
            {popupVisible && (
                <div id="popup" className="popup">
                    <div className="popup-content">
                        <span id="name-popup">
                            {popupUsername} wants to join the room.
                        </span>
                        <button id="accept-btn" onClick={handlePopupAccept}>
                            Accept
                        </button>
                        <button id="deny-btn" onClick={handlePopupDeny}>
                            Deny
                        </button>
                    </div>
                </div>
            )}
            <div className="tools-and-colors-container">
                <div className="tools">
                    <div
                        className={`tool pen ${
                            tool === "pen" ? "active-button" : ""
                        }`}
                        onClick={() => selectTool("pen")}
                    >
                        <img src={pen} alt="pen" />
                    </div>
                    <div
                        className={`tool rectangle ${
                            tool === "rect" ? "active-button" : ""
                        }`}
                        onClick={() => selectTool("rect")}
                    >
                        <img src={rectangle} alt="rectangle" />
                    </div>
                    <div
                        className={`tool ellipse ${
                            tool === "ellipse" ? "active-button" : ""
                        }`}
                        onClick={() => selectTool("ellipse")}
                    >
                        <img src={ellipse} alt="ellipse" />
                    </div>
                    <div
                        className={`tool eraser ${
                            tool === "eraser" ? "active-button" : ""
                        }`}
                        onClick={() => selectTool("eraser")}
                    >
                        <img src={eraser} alt="eraser" />
                    </div>
                    <div
                        className={`tool edit ${
                            tool === "edit" ? "active-button" : ""
                        }`}
                        onClick={() => selectTool("edit")}
                    >
                        <img src={edit} alt="edit" />
                    </div>
                </div>
                <div className="colors">
                    {colors.map((color) => (
                        <div
                            key={color}
                            className={`color-border ${
                                selectedColor === color
                                    ? "color-border-active"
                                    : ""
                            }`}
                            onClick={() => setSelectedColor(color)}
                        >
                            <div
                                className="color"
                                style={{ backgroundColor: color }}
                            ></div>
                        </div>
                    ))}
                </div>
                {/* Hamburger Menu */}
                <div className="hamburger-container">
                    <button
                        className="hamburger-btn"
                        onClick={handleMenuToggle}
                    >
                        ☰
                        {newMessagesDot &&
                            activeTab === "chat" &&
                            !menuVisible && (
                                <span className="notification-dot"></span>
                            )}
                        {newMessagesDot && activeTab === "members" && (
                            <span className="notification-dot"></span>
                        )}
                    </button>
                </div>
                <div
                    className={`hamburger-menu ${menuVisible ? "visible" : ""}`}
                >
                    <button
                        className="hamburger-btn"
                        onClick={handleMenuToggle}
                    >
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
                                !menuVisible ? (
                                    <span className="notification-dot"></span>
                                ) : null}
                            </button>
                        </div>
                        {activeTab === "members" && (
                            <div className="members-list">
                                {loading ? (
                                    <InlineLoadingSpinner />
                                ) : (
                                    (console.log("inside member", users),
                                    users.map((user, index) => (
                                        <div key={index} className="user-item">
                                            <img src={user.dp_url} />
                                            <span>{user.full_name}</span>
                                        </div>
                                    )))
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
                                                    message.id ||
                                                    message.timestamp
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
            <canvas
                ref={canvasRef}
                width={1680}
                height={640}
                style={{ border: "1px solid black" }}
            ></canvas>
        </div>
    )
}

export default Canvas
