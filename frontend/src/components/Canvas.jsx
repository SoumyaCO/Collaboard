import React, { useRef, useState, useCallback, useEffect } from "react";
import Rectangle from "../utils/Rectangle";
import Ellipse from "../utils/Ellipse";
import pen from "../assets/pen.png";
import eraser from "../assets/eraser.png";
import rectangle from "../assets/rectangle.png";
import ellipse from "../assets/ellipse.png";
import textfield from "../assets/text-field.png";

import edit from "../assets/edit.png";

import send from "../assets/send.png";
import { useNavigate } from "react-router-dom";

import { socket } from "./Create_hash";
import { emitDrawing } from "../utils/Socket";
import { useLocation } from "react-router-dom";
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
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState(null); // Position where the text will be drawn

  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [users, setUsers] = useState([{ username: "", photo: "" }]);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("username") || "unknown"
  );
  const handlePathsRef = useRef([]);
  const handlesRef = useRef([]);

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
  function calculateBuffer(width, height, gap) {
    let bufferX = gap;
    let bufferY = gap;
    if (width < 0) {
      bufferX = -gap;
    } else {
      bufferX = gap;
    }
    if (height < 0) {
      bufferY = -gap;
    } else {
      bufferY = gap;
    }
    return [bufferX, bufferY];
  }

  const highlight = (ctx, id, stack) => {
    const gap = 15;
    const handleGap = 2;
    ctx.strokeStyle = "#0018F9";
    ctx.lineWidth = 3;
    const borderRadius = 10;
    const smallRectSize = 4;

    let rect = stack[id];
    if (!rect) return;

    let [bufferX, bufferY] = calculateBuffer(rect.width, rect.height, gap);

    const x = rect.x - bufferX;
    const y = rect.y - bufferY;
    const width = rect.width + bufferX * 2;
    const height = rect.height + bufferY * 2;

    // Draw the main highlighted border with rounded corners
    drawRoundedRect(ctx, x, y, width, height, borderRadius);

    const halfSmallRectSize = smallRectSize / 2;

    const handles = {
      topLeft: createHandlePath(
        x - handleGap,
        y - handleGap,
        smallRectSize,
        borderRadius
      ),
      topRight: createHandlePath(
        x + width - smallRectSize + handleGap,
        y - handleGap,
        smallRectSize,
        borderRadius
      ),
      bottomLeft: createHandlePath(
        x - handleGap,
        y + height - smallRectSize + handleGap,
        smallRectSize,
        borderRadius
      ),
      bottomRight: createHandlePath(
        x + width - smallRectSize + handleGap,
        y + height - smallRectSize + handleGap,
        smallRectSize,
        borderRadius
      ),
      topMiddle: createHandlePath(
        x + width / 2 - halfSmallRectSize,
        y - handleGap,
        smallRectSize,
        borderRadius
      ),
      bottomMiddle: createHandlePath(
        x + width / 2 - halfSmallRectSize,
        y + height - smallRectSize + handleGap,
        smallRectSize,
        borderRadius
      ),
      leftMiddle: createHandlePath(
        x - handleGap,
        y + height / 2 - halfSmallRectSize,
        smallRectSize,
        borderRadius
      ),
      rightMiddle: createHandlePath(
        x + width - smallRectSize + handleGap,
        y + height / 2 - halfSmallRectSize,
        smallRectSize,
        borderRadius
      ),
    };

    const handlePaths = Object.values(handles).map((handle) => {
      ctx.stroke(handle);
      return handle;
    });
    console.log("selectedId in highlighted ", selectedId);
    return { handlePaths, handles, selectedId: id };
  };

  // Function to create a handle Path2D object
  function createHandlePath(x, y, size, radius) {
    const path = new Path2D();
    path.moveTo(x + radius, y);
    path.lineTo(x + size - radius, y);
    path.quadraticCurveTo(x + size, y, x + size, y + radius);
    path.lineTo(x + size, y + size - radius);
    path.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    path.lineTo(x + radius, y + size);
    path.quadraticCurveTo(x, y + size, x, y + size - radius);
    path.lineTo(x, y + radius);
    path.quadraticCurveTo(x, y, x + radius, y);
    path.closePath();
    return path;
  }

  // Draw a rounded rectangle
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
  };

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    return ctx;
  }, []);
  const drawFromStack = (stack = []) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stack.forEach((shape, index) => {
      // Draw rectangles
      if (shape.tool === "rect" && shape.isAlive) {
        const rectangle = new Rectangle(
          [shape.x, shape.y],
          [shape.width, shape.height],
          shape.color
        );
        rectangle.drawRectangle(ctx);
      }
      // Draw ellipses
      else if (shape.tool === "ellipse" && shape.isAlive) {
        const ellipse = new Ellipse(
          [shape.x, shape.y],
          [shape.width / 2, shape.height / 2],
          shape.color
        );
        ellipse.drawEllipseFill(ctx);
      }

      // Draw text if it exists
      if (shape.text && shape.textPosition) {
        drawText(ctx, shape.text, shape.textPosition.x, shape.textPosition.y);
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

  const handleCanvasMouseMove = useCallback(
    (event) => {
      const { offsetX, offsetY } = event;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      let cursor = "auto";

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFromStack(drawingStack);

      // Highlight only the selected drawing if there is one
      if (selectedId !== null && selectedId !== undefined) {
        const rect = drawingStack[selectedId];

        if (rect) {
          const { handlePaths, handles } = highlight(
            ctx,
            selectedId,
            drawingStack
          );
          handlePathsRef.current = handlePaths; // Store handlePaths
          handlesRef.current = handles;

          // Check if the mouse is over any of the small rectangles (handles)
          handlePaths.forEach((path) => {
            if (ctx.isPointInPath(path, offsetX, offsetY)) {
              //  which handle was hovered
              if (path === handles.topLeft) cursor = "nwse-resize";
              else if (path === handles.topRight) cursor = "nesw-resize";
              else if (path === handles.bottomLeft) cursor = "nwse-resize";
              else if (path === handles.bottomRight) cursor = "nesw-resize";
              else if (path === handles.topMiddle) cursor = "ns-resize";
              else if (path === handles.bottomMiddle) cursor = "ns-resize";
              else if (path === handles.leftMiddle) cursor = "ew-resize";
              else if (path === handles.rightMiddle) cursor = "ew-resize";
            }
          });
        }
      }

      // Update the canvas cursor style
      canvas.style.cursor = cursor;
    },
    [drawingStack, selectedId]
  );

  const drawText = (ctx, text, x, y) => {
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(text, x, y);
  };

  const handleMouseDown = useCallback(
    (event) => {
      const ctx = getContext();
      const { offsetX, offsetY } = event;
      const id = detectCollision({ offsetX, offsetY }, drawingStack);

      setMouseState("mousedown");
      setMouseMoved(false);

      if (tool === "edit") {
        if (id !== selectedId) {
          setSelectedId(id);
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          drawFromStack(drawingStack);
          highlight(ctx, id, drawingStack);
        }
        const handlePaths = handlePathsRef.current;
        const handles = handlesRef.current;
        let handleHit = false;

        handlePaths.forEach((path) => {
          if (ctx.isPointInPath(path, offsetX, offsetY)) {
            handleHit = true;
            setSelectedId(id);

            // Set resize handle based on which handle was clicked
            if (path === handles.topLeft) {
              setResizeHandle("top-left");
              setSelectedId(id);
              console.log(selectedId);
            } else if (path === handles.topRight) {
              setResizeHandle("top-right");
              setSelectedId(id);
              console.log(selectedId);
            } else if (path === handles.bottomLeft) {
              setResizeHandle("bottom-left");
              setSelectedId(id);
              console.log(selectedId);
            } else if (path === handles.bottomRight) {
              setResizeHandle("bottom-right");
              setSelectedId(id);
              console.log(selectedId);
            } else if (path === handles.topMiddle) {
              setResizeHandle("top");
              setSelectedId(id);
              console.log(selectedId);
            } else if (path === handles.bottomMiddle) {
              setResizeHandle("bottom");
              setSelectedId(id);
              console.log(selectedId);
            } else if (path === handles.leftMiddle) {
              setResizeHandle("left");
              setSelectedId(id);
              console.log(selectedId);
            } else if (path === handles.rightMiddle) {
              setResizeHandle("right");
              setSelectedId(id);
              console.log(selectedId);
            }
          }
        });

        if (!handleHit) {
          if (id !== -1) {
            setSelectedId(id);
            setResizeHandle(null);
          } else {
            setSelectedId(null);
          }
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
    [getContext, drawingStack, tool, selectedId]
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

      // let updatedStack;
      // let updatedRect;

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
      const { offsetX, offsetY } = event;
      const canvas = canvasRef.current;
      const ctx = getContext();

      handleCanvasMouseMove(event);

      if (mouseState === "mousedown") {
        if (tool === "edit" && selectedId !== null) {
          const id = selectedId
          const rect = drawingStack[selectedId];
          highlight(ctx, id, drawingStack);

          console.log(resizeHandle);
          console.log(rect);

          if (resizeHandle) {
            // Handle resizing logic based on the selected resizeHandle
            switch (resizeHandle) {
              case "bottom-right":
                console.log("bottom-right in mouse move ");

                drawingStack[selectedId].width = offsetX - rect.x;
                drawingStack[selectedId].height = offsetY - rect.y;
                break;
              case "top-left":
                const deltaXTopLeft = rect.x - offsetX;
                const deltaYTopLeft = rect.y - offsetY;

                drawingStack[selectedId].width = rect.width + deltaXTopLeft;
                drawingStack[selectedId].height = rect.height + deltaYTopLeft;
                drawingStack[selectedId].x = offsetX;
                drawingStack[selectedId].y = offsetY;
                break;
              case "top-right":
                drawingStack[selectedId].width = offsetX - rect.x;
                drawingStack[selectedId].height =
                  rect.height + (rect.y - offsetY);
                drawingStack[selectedId].y = offsetY;
                break;
              case "bottom-left":
                drawingStack[selectedId].width =
                  rect.width + (rect.x - offsetX);
                drawingStack[selectedId].height = offsetY - rect.y;
                drawingStack[selectedId].x = offsetX;
                break;
              case "top":
                drawingStack[selectedId].height =
                  rect.height + (rect.y - offsetY);
                drawingStack[selectedId].y = offsetY;
                break;
              case "bottom":
                drawingStack[selectedId].height = offsetY - rect.y;
                break;
              case "left":
                drawingStack[selectedId].width =
                  rect.width + (rect.x - offsetX);
                drawingStack[selectedId].x = offsetX;
                break;
              case "right":
                drawingStack[selectedId].width = offsetX - rect.x;
                break;
              default:
                break;
            }
            console.log(
              "mouse move id w , h",
              drawingStack[selectedId].height,
              drawingStack[selectedId].width
            );

            // Update the stack with the modified rectangle
            setDrawingStack(drawingStack);
            drawFromStack(drawingStack); // Redraw the canvas with updated shapes
          } else {
            // Handle moving the rectangle if no resizeHandle is active
            drawingStack[selectedId].x += offsetX - mouseX;
            drawingStack[selectedId].y += offsetY - mouseY;
            setDrawingStack(drawingStack);
            setMouseX(offsetX);
            setMouseY(offsetY);
            drawFromStack(drawingStack);
          }
        } else if (tool === "rect" || tool === "ellipse") {
          const width = offsetX - drawingData.startX;
          const height = offsetY - drawingData.startY;

          setDrawingData((prevData) => ({ ...prevData, width, height }));

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawFromStack(drawingStack);

          ctx.strokeStyle = "rgba(0, 120, 215, 0.3)";
          ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
          ctx.lineWidth = 1;

          if (tool === "rect") {
            ctx.strokeRect(
              drawingData.startX,
              drawingData.startY,
              width,
              height
            );
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
  );

  useEffect(() => {
    drawFromStack(drawingStack);
  }, [drawingStack]);

  useEffect(() => {
    const canvas = canvasRef.current;
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
            className={`tool text ${tool === "text" ? "active-button" : ""}`}
            onClick={() => selectTool("text")}
          >
            <img src={textfield} alt="text" />
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
        height={710}
        style={{ border: "1px solid black" }}
      ></canvas>
    </div>
  );
};

export default Canvas;
