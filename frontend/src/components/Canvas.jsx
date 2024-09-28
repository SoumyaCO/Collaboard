import React, { useRef, useState, useCallback, useEffect } from "react";
import Rectangle from "../utils/Rectangle";
import Ellipse from "../utils/Ellipse";
import pen from "../assets/pen.png";
import eraser from "../assets/eraser.png";
import rectangle from "../assets/rectangle.png";
import ellipse from "../assets/ellipse.png";
import edit from "../assets/edit.png";
import send from "../assets/send.png";
import { useNavigate } from "react-router-dom";
import { socket } from "./Create_hash";
import { emitDrawing } from "../utils/Socket";
import { useLocation } from "react-router-dom";
import { calculateBuffer } from "../utils/gap";
import { updateCursor } from "../utils/cursor";
import { highlightRect } from "../utils/highlight";

const Canvas = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("red");
  const [drawingStack, setDrawingStack] = useState(
    location.state?.drawingStack || []
  );
  const [mouseState, setMouseState] = useState("idle"); // idle', 'mousedown', 'mouseup', or 'mousemove'
  const [mouseMoved, setMouseMoved] = useState(false);
  const [isCustomCursor, setIsCustomCursor] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [highlightobj, setHighlightobj] = useState(null);

  const [drawingData, setDrawingData] = useState({
    id: 1,
    tool: "pen",
    color: "red",
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
    strokeWidth: 2,
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupUsername, setPopupUsername] = useState("");
  const [clientID, setClientID] = useState("");
  const [roomID, setRoomID] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [users, setUsers] = useState([{ username: "", photo: "" }]);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("username") || "unknown"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const isPageRefreshed = sessionStorage.getItem("isPageRefreshed");

    if (isPageRefreshed) {
      sessionStorage.removeItem("isPageRefreshed");
      navigate("/");
    } else {
      sessionStorage.setItem("isPageRefreshed", "true");
    }

    return () => {
      sessionStorage.removeItem("isPageRefreshed");
    };
  }, [navigate]);
  useEffect(() => {
    socket.on("draw-on-canvas", (data) => {
      if (data && Array.isArray(data.drawingStack)) {
        setDrawingStack(data.drawingStack);
        drawFromStack(data.drawingStack);
      }
    });

    return () => {
      socket.off("draw-on-canvas");
    };
  }, []);
  useEffect(() => {
    socket.on("new-joiner-alert", (data) => {
      setPopupUsername(data.username);
      setClientID(data.clientID);
      setRoomID(data.roomID);

      setPopupVisible(true);
    });

    return () => {
      socket.off("new-joiner-alert");
      socket.off("draw-on-canvas");
    };
  }, []);

  const handlePopupAccept = () => {
    console.log("admin accepted");
    console.log("accept", drawingStack);

    socket.emit("permission", {
      clientID: clientID,
      roomID: roomID,
      allow: true,
      message: "welcome friend",
      drawingStack: drawingStack,
    });
    setPopupVisible(false);
  };

  const handlePopupDeny = () => {
    socket.emit("permission", {
      clientID: clientID,
      roomID: roomID,
      allow: false,
      message: "get lost",
      drawingStack: [],
    });
    setPopupVisible(false);
  };

  const handleMenuToggle = () => {
    setMenuVisible((prev) => !prev);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleChatInputChange = (event) => {
    setChatInput(event.target.value);
  };
  useEffect(() => {
    socket.on("send-message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
    return () => {
      socket.off("send-message");
    };
  }, []);
  const handleSendMessage = () => {
    let id = sessionStorage.getItem("sessionHash") || roomID;
    if (chatInput.trim()) {
      const message = {
        text: chatInput,
        senderId: currentUserId,
        username: currentUserId,
        roomID: id,
      };

      socket.emit("chat-message", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setChatInput("");
    }
  };

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    return ctx;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    setHighlightobj(new highlightRect(ctx));
  }, []);

  const drawFromStack = (stack = []) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stack.forEach((shape, index) => {
      if (shape.tool === "rect" && shape.isAlive) {
        const rectangle = new Rectangle(
          [shape.x, shape.y],
          [shape.width, shape.height],
          shape.color
        );
        rectangle.drawRectangle(ctx);
      } else if (shape.tool === "ellipse" && shape.isAlive) {
        const ellipse = new Ellipse(
          [shape.x, shape.y],
          [shape.width / 2, shape.height / 2],
          shape.color
        );
        ellipse.drawEllipseFill(ctx);
      }

      if (index === selectedId) {
        highlightobj.highlightDraw(
          shape.x - 10,
          shape.y - 10,
          shape.height + 19,
          shape.width + 19,
          6
        );
      }
    });
  };

  const detectCollision = ({ offsetX, offsetY }, shapes) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      const { x, y, width, height, tool } = shape;
      const path = new Path2D();

      if (tool === "rect") {
        path.rect(x, y, width, height);
      } else if (tool === "ellipse") {
        path.ellipse(
          x + width / 2,
          y + height / 2,
          Math.abs(width) / 2,
          Math.abs(height) / 2,
          0,
          0,
          2 * Math.PI
        );
      }

      if (ctx.isPointInPath(path, offsetX, offsetY)) {
        return i;
      }
    }

    return -1;
  };

  // const highlight = (ctx, id, stack) => {
  //   const gap = 9;
  //   ctx.strokeStyle = "#0018F9";
  //   ctx.lineWidth = 3;

  //   let rect = stack[id];
  //   let [bufferX, bufferY] = calculateBuffer(rect.width, rect.height, gap);

  //   const x = rect.x - bufferX;
  //   const y = rect.y - bufferY;
  //   const width = rect.width + bufferX * 2;
  //   const height = rect.height + bufferY * 2;

  //   const highlightPath = new Path2D();
  //   highlightPath.rect(x, y, width, height);

  //   // Draw the highlighted border
  //   ctx.stroke(highlightPath);

  //   return highlightPath;
  // };

  const handleMouseDown = useCallback(
    (event) => {
      const ctx = getContext();

      const { offsetX, offsetY } = event;
      const id = detectCollision({ offsetX, offsetY }, drawingStack);

      setMouseState("mousedown");
      setMouseMoved(false);

      if (tool === "edit" && id !== -1) {
        setIsDrawing(true);
        setSelectedId(id);
        setMouseX(offsetX);
        setMouseY(offsetY);

        const selectedDrawing = drawingStack[id];

        if (selectedDrawing) {
          // Draw highlight
          highlightobj.resizeHighlight(
            ctx,
            selectedDrawing.x - 5, // Adjust for gap
            selectedDrawing.y - 5, // Adjust for gap
            selectedDrawing.height + 10, // Adjust for gap
            selectedDrawing.width + 10, // Adjust for gap
            10
          );
          highlightobj.highlightDraw(ctx);
        }

        const handleSize = 6;

        // Determine the resize handle
        const isInResizeHandle = (x, y) => {
          return (
            (x >= selectedDrawing.x + selectedDrawing.width - handleSize &&
              x <= selectedDrawing.x + selectedDrawing.width &&
              y >= selectedDrawing.y + selectedDrawing.height - handleSize &&
              y <= selectedDrawing.y + selectedDrawing.height &&
              "bottom-right") ||
            (x <= selectedDrawing.x + handleSize &&
              y <= selectedDrawing.y + handleSize &&
              "top-left") ||
            (x >= selectedDrawing.x + selectedDrawing.width - handleSize &&
              y <= selectedDrawing.y + handleSize &&
              "top-right") ||
            (x <= selectedDrawing.x + handleSize &&
              y >= selectedDrawing.y + selectedDrawing.height - handleSize &&
              "bottom-left") ||
            (x >= selectedDrawing.x + handleSize &&
              x <= selectedDrawing.x + selectedDrawing.width - handleSize &&
              y <= selectedDrawing.y + handleSize &&
              "top") ||
            (x >= selectedDrawing.x + handleSize &&
              x <= selectedDrawing.x + selectedDrawing.width - handleSize &&
              y >= selectedDrawing.y + selectedDrawing.height - handleSize &&
              "bottom") ||
            (x <= selectedDrawing.x + handleSize &&
              y >= selectedDrawing.y + handleSize &&
              y <= selectedDrawing.y + selectedDrawing.height - handleSize &&
              "left") ||
            (x >= selectedDrawing.x + selectedDrawing.width - handleSize &&
              y >= selectedDrawing.y + handleSize &&
              y <= selectedDrawing.y + selectedDrawing.height - handleSize &&
              "right")
          );
        };

        const resizeHandle = isInResizeHandle(offsetX, offsetY);
        setResizeHandle(resizeHandle || null);

        if (!isCustomCursor) {
          canvasRef.current.style.cursor = "auto";
        }
      } else if (tool === "eraser" && id !== -1) {
        const updatedStack = drawingStack.filter((_, index) => index !== id);
        setDrawingStack(updatedStack);
        drawFromStack(updatedStack);
        emitDrawing(socket, { drawingStack: updatedStack, message: "hi" });
      } else if (tool === "rect" || tool === "ellipse") {
        setIsDrawing(true);
        setMouseMoved(true);
        setDrawingData((prevData) => ({
          ...prevData,
          startX: offsetX,
          startY: offsetY,
          color: selectedColor,
          tool: tool,
        }));
      }
    },
    [getContext, drawingStack, tool, selectedColor, isCustomCursor]
  );

  const handleMouseUp = useCallback(
    (event) => {
      if (mouseState !== "mousedown") return;
      setMouseState("mouseup");
      if (!isDrawing) return;
      if (!mouseMoved) {
        // If mouse didn't move, reset drawing
        setIsDrawing(false);
        setMouseState("idle");
        canvasRef.current.style.cursor = "auto";
        return;
      }

      const ctx = getContext();
      const { offsetX, offsetY } = event;
      const width = offsetX - drawingData.startX;
      const height = offsetY - drawingData.startY;

      let updatedStack;

      if (tool === "rect") {
        if (width === 0 || height === 0) return;

        let rect = new Rectangle(
          [drawingData.startX, drawingData.startY],
          [width, height],
          drawingData.color
        );

        // Update the drawing stack
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
                  };
                }
                return r;
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
              ];

        setDrawingStack(updatedStack);
        drawFromStack(updatedStack);
        setDrawingData((prev) => ({ ...prev, id: prev.id + 1 }));
      } else if (tool === "ellipse") {
        if (width === 0 || height === 0) return;

        let ellipse = new Ellipse(
          [drawingData.startX, drawingData.startY],
          [width / 2, height / 2],
          drawingData.color
        );

        // Update the drawing stack
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
                  };
                }
                return e;
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
              ];

        setDrawingStack(updatedStack);
        drawFromStack(updatedStack);
        setDrawingData((prev) => ({ ...prev, id: prev.id + 1 }));
      }

      setIsDrawing(false);
      setSelectedId(null);
      setResizeHandle(null);

      emitDrawing(socket, { drawingStack: updatedStack, message: "hi" });
      canvasRef.current.style.cursor = "auto";
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
  );
  const handleMouseMove = useCallback(
    (event) => {
      if (mouseState !== "mousedown") return;

      const ctx = getContext();
      if (!ctx) return; // Ensure context is available

      const { offsetX, offsetY } = event;
      let updatedStack = [...drawingStack];
      const rect = selectedId !== null ? drawingStack[selectedId] : null;

      if (tool === "edit" && selectedId !== null) {
        if (highlightobj) {
          highlightobj.changeCurser(
            ctx,
            offsetX,
            offsetY,
            setIsCustomCursor,
            5
          );
        }

        if (resizeHandle) {
          const updatedRect = { ...rect };

          // Update dimensions based on the resize handle
          switch (resizeHandle) {
            case "bottom-right":
              updatedRect.width = offsetX - rect.x;
              updatedRect.height = offsetY - rect.y;
              break;
            case "top-left":
              updatedRect.width = rect.width + (rect.x - offsetX);
              updatedRect.height = rect.height + (rect.y - offsetY);
              updatedRect.x = offsetX;
              updatedRect.y = offsetY;
              break;
            case "top-right":
              updatedRect.width = offsetX - rect.x;
              updatedRect.height = rect.height + (rect.y - offsetY);
              updatedRect.y = offsetY;
              break;
            case "bottom-left":
              updatedRect.width = rect.width + (rect.x - offsetX);
              updatedRect.height = offsetY - rect.y;
              updatedRect.x = offsetX;
              break;
            case "top":
              updatedRect.height = rect.height + (rect.y - offsetY);
              updatedRect.y = offsetY;
              break;
            case "bottom":
              updatedRect.height = offsetY - rect.y;
              break;
            case "left":
              updatedRect.width = rect.width + (rect.x - offsetX);
              updatedRect.x = offsetX;
              break;
            case "right":
              updatedRect.width = offsetX - rect.x;
              break;
            default:
              break;
          }

          updatedStack[selectedId] = updatedRect;
        } else {
          // Move the selected shape
          const updatedRect = { ...rect };
          updatedRect.x += offsetX - mouseX;
          updatedRect.y += offsetY - mouseY;
          updatedStack[selectedId] = updatedRect;
          setMouseX(offsetX);
          setMouseY(offsetY);
        }

        setDrawingStack(updatedStack);
        drawFromStack(updatedStack);
      } else if (tool === "rect" || tool === "ellipse") {
        const width = offsetX - drawingData.startX;
        const height = offsetY - drawingData.startY;

        setDrawingData((prevData) => ({ ...prevData, width, height }));

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawFromStack(drawingStack);

        ctx.strokeStyle = "rgba(0, 120, 215, 0.3)";
        ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
        ctx.lineWidth = 1;

        if (tool === "rect") {
          ctx.strokeRect(drawingData.startX, drawingData.startY, width, height);
        } else if (tool === "ellipse") {
          ctx.beginPath();
          ctx.ellipse(
            drawingData.startX + width / 2,
            drawingData.startY + height / 2,
            Math.abs(width) / 2,
            Math.abs(height) / 2,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.fill();
        }
      }

      emitDrawing(socket, { drawingStack: updatedStack, message: "hi" });
    },
    [
      highlightobj,
      drawingData,
      tool,
      getContext,
      drawingStack,
      selectedId,
      mouseX,
      mouseY,
      resizeHandle,
    ]
  );

  useEffect(() => {
    drawFromStack(drawingStack);
  }, [drawingStack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", () => {
      setIsDrawing(false);
      setMouseState("idle");
    });

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", () => {
        setIsDrawing(false);
        setMouseState("idle");
      });
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const selectTool = (newTool) => {
    setTool(newTool);
    setDrawingData((prev) => ({ ...prev, tool: newTool }));
  };

  const colors = ["red", "blue", "green", "yellow", "black"];

  return (
    <div className="app">
      {popupVisible && (
        <div id="popup" className="popup">
          <div className="popup-content">
            <span id="name-popup">{popupUsername} wants to join the room.</span>
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
            className={`tool pen ${tool === "pen" ? "active-button" : ""}`}
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
            className={`tool edit ${tool === "edit" ? "active-button" : ""}`}
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
                selectedColor === color ? "color-border-active" : ""
              }`}
              onClick={() => setSelectedColor(color)}
            >
              <div className="color" style={{ backgroundColor: color }}></div>
            </div>
          ))}
        </div>
        {/* Hamburger Menu */}
        <div className="hamburger-container">
          <button className="hamburger-btn" onClick={handleMenuToggle}>
            ☰
          </button>
        </div>
        <div className={`hamburger-menu ${menuVisible ? "visible" : ""}`}>
          <button className="hamburger-btn" onClick={handleMenuToggle}>
            ⬅
          </button>
          <div className="menu-content">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "members" ? "active" : ""}`}
                onClick={() => handleTabChange("members")}
              >
                Members
              </button>
              <button
                className={`tab ${activeTab === "chat" ? "active" : ""}`}
                onClick={() => handleTabChange("chat")}
              >
                Chat
              </button>
            </div>
            {activeTab === "members" && (
              <div className="members-tab">
                {users.map((user) => (
                  <div key={user.username} className="member">
                    <img src="" alt="username" className="member-photo" />
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "chat" && (
              <div className="chat-tab">
                <div className="messages">
                  {messages.map((message) => (
                    <div
                      key={message.id || message.timestamp}
                      className={`message ${
                        message.senderId === currentUserId
                          ? "message-sent"
                          : "message-received"
                      }`}
                    >
                      <div className="username">
                        {message.senderId === currentUserId
                          ? "You"
                          : message.username}
                      </div>
                      <div className="message-text">{message.text}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={handleChatInputChange}
                    placeholder="Type a message..."
                  />
                  <img
                    className="send-button"
                    onClick={handleSendMessage}
                    src={send}
                    alt="Send"
                  />
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
  );
};

export default Canvas;
