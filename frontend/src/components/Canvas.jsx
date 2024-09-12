import React, { useRef, useState, useCallback, useEffect } from "react";
import Rectangle from "../utils/Rectangle";
import Ellipse from "../utils/Ellipse";
import pen from "../assets/pen.png";
import eraser from "../assets/eraser.png";
import rectangle from "../assets/rectangle.png";
import ellipse from "../assets/ellipse.png";
import edit from "../assets/edit.png";
import { socket } from "./Create_hash";
import { emitDrawing } from "../utils/Socket";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("red");
  const [drawingStack, setDrawingStack] = useState(
    location.state?.drawingStack || []
  );
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

  socket.on("draw-on-canvas", (data) => {
    setDrawingStack(data.drawingStack);
    drawFromStack(data.drawingStack);
    console.log("draw-on-canvas", data.drawingStack);
  });

  useEffect(() => {
    socket.on("draw-on-canvas", (drawingData) => {
      setDrawingStack((prevStack) => [...prevStack, drawingData]);
    });
    socket.on("new-joiner-alert", (data) => {
      console.log("new joiner hit");

      setPopupUsername(data.username);
      setClientID(data.clientID);
      setRoomID(data.roomID);

      setPopupVisible(true);
    });

    return () => {
      socket.off("user-requested-to-join");
      socket.off("send-current-state");
      socket.off("draw-on-canvas");
    };
  }, []);

  const handlePopupAccept = () => {
    console.log("admin accepted");

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
    socket.emit("deny-user", {
      clientID: clientID,
      roomID: roomID,
      allow: false,
      message: "get lost",
      drawingStack: [],
    });
    setPopupVisible(false);
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

  const updateCursor = (offsetX, offsetY, rect) => {
    const handleSize = 8;
    let cursor = "auto";

    if (
      offsetX >= rect.x + rect.width - handleSize &&
      offsetX <= rect.x + rect.width &&
      offsetY >= rect.y + rect.height - handleSize &&
      offsetY <= rect.y + rect.height
    ) {
      cursor = "nwse-resize";
    } else if (
      offsetX <= rect.x + handleSize &&
      offsetY <= rect.y + handleSize
    ) {
      cursor = "nesw-resize";
    } else if (
      offsetX >= rect.x + rect.width - handleSize &&
      offsetY <= rect.y + handleSize
    ) {
      cursor = "nesw-resize";
    } else if (
      offsetX <= rect.x + handleSize &&
      offsetY >= rect.y + rect.height - handleSize
    ) {
      cursor = "nwse-resize";
    } else if (
      offsetX >= rect.x + handleSize &&
      offsetX <= rect.x + rect.width - handleSize &&
      offsetY <= rect.y + handleSize
    ) {
      cursor = "ns-resize";
    } else if (
      offsetX >= rect.x + handleSize &&
      offsetX <= rect.x + rect.width - handleSize &&
      offsetY >= rect.y + rect.height - handleSize
    ) {
      cursor = "ns-resize";
    } else if (
      offsetX <= rect.x + handleSize &&
      offsetY >= rect.y + handleSize &&
      offsetY <= rect.y + rect.height - handleSize
    ) {
      cursor = "ew-resize";
    } else if (
      offsetX >= rect.x + rect.width - handleSize &&
      offsetY >= rect.y + handleSize &&
      offsetY <= rect.y + rect.height - handleSize
    ) {
      cursor = "ew-resize";
    }

    return cursor;
  };

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    return ctx;
  }, []);

  const drawFromStack = (stack) => {
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
        highlight(ctx, index, stack);
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

  const highlight = (ctx, id, stack) => {
    const gap = 7;
    ctx.strokeStyle = "#0018F9";
    ctx.lineWidth = 3;

    let rect = stack[id];
    let [bufferX, bufferY] = calculateBuffer(rect.width, rect.height, gap);

    const x = rect.x - bufferX;
    const y = rect.y - bufferY;
    const width = rect.width + bufferX * 2;
    const height = rect.height + bufferY * 2;

    ctx.strokeRect(x, y, width, height);
  };

  const handleMouseDown = useCallback(
    (event) => {
      const ctx = getContext();
      const { offsetX, offsetY } = event;
      const id = detectCollision({ offsetX, offsetY }, drawingStack);

      if (tool === "edit" && id !== -1) {
        setIsDrawing(true);
        setSelectedId(id);
        setMouseX(offsetX);
        setMouseY(offsetY);

        const rect = drawingStack[id];

        const handleSize = 6;

        if (
          offsetX >= rect.x + rect.width - handleSize &&
          offsetX <= rect.x + rect.width &&
          offsetY >= rect.y + rect.height - handleSize &&
          offsetY <= rect.y + rect.height
        ) {
          setResizeHandle("bottom-right");
        } else if (
          offsetX <= rect.x + handleSize &&
          offsetY <= rect.y + handleSize
        ) {
          setResizeHandle("top-left");
        } else if (
          offsetX >= rect.x + rect.width - handleSize &&
          offsetY <= rect.y + handleSize
        ) {
          setResizeHandle("top-right");
        } else if (
          offsetX <= rect.x + handleSize &&
          offsetY >= rect.y + rect.height - handleSize
        ) {
          setResizeHandle("bottom-left");
        } else if (
          offsetX >= rect.x + handleSize &&
          offsetX <= rect.x + rect.width - handleSize &&
          offsetY <= rect.y + handleSize
        ) {
          setResizeHandle("top");
        } else if (
          offsetX >= rect.x + handleSize &&
          offsetX <= rect.x + rect.width - handleSize &&
          offsetY >= rect.y + rect.height - handleSize
        ) {
          setResizeHandle("bottom");
        } else if (
          offsetX <= rect.x + handleSize &&
          offsetY >= rect.y + handleSize &&
          offsetY <= rect.y + rect.height - handleSize
        ) {
          setResizeHandle("left");
        } else if (
          offsetX >= rect.x + rect.width - handleSize &&
          offsetY >= rect.y + handleSize &&
          offsetY <= rect.y + rect.height - handleSize
        ) {
          setResizeHandle("right");
        } else {
          setResizeHandle(null);
        }
      } else if (tool === "eraser" && id !== -1) {
        const updatedStack = drawingStack.filter((_, index) => index !== id);
        setDrawingStack(updatedStack);
        drawFromStack(updatedStack);
      } else if (tool === "rect" || tool === "ellipse") {
        setIsDrawing(true);

        setDrawingData((prevData) => ({
          ...prevData,
          startX: offsetX,
          startY: offsetY,
          color: selectedColor,
          tool: tool,
        }));
      }
    },
    [getContext, drawingStack, tool, selectedColor]
  );

  const handleMouseMove = useCallback(
    (event) => {
      if (!isDrawing) return;

      const ctx = getContext();
      const { offsetX, offsetY } = event;
      const canvas = canvasRef.current;

      if (tool === "edit" && selectedId !== null) {
        const rect = drawingStack[selectedId];
        const cursor = updateCursor(offsetX, offsetY, rect);

        canvas.style.cursor = cursor;

        if (resizeHandle) {
          let updatedStack = [...drawingStack];
          let updatedRect = { ...rect };

          if (resizeHandle === "bottom-right") {
            updatedRect.width = offsetX - rect.x;
            updatedRect.height = offsetY - rect.y;
          } else if (resizeHandle === "top-left") {
            updatedRect.width = rect.width + (rect.x - offsetX);
            updatedRect.height = rect.height + (rect.y - offsetY);
            updatedRect.x = offsetX;
            updatedRect.y = offsetY;
          } else if (resizeHandle === "top-right") {
            updatedRect.width = offsetX - rect.x;
            updatedRect.height = rect.height + (rect.y - offsetY);
            updatedRect.y = offsetY;
          } else if (resizeHandle === "bottom-left") {
            updatedRect.width = rect.width + (rect.x - offsetX);
            updatedRect.height = offsetY - rect.y;
            updatedRect.x = offsetX;
          } else if (resizeHandle === "top") {
            updatedRect.height = rect.height + (rect.y - offsetY);
            updatedRect.y = offsetY;
          } else if (resizeHandle === "bottom") {
            updatedRect.height = offsetY - rect.y;
          } else if (resizeHandle === "left") {
            updatedRect.width = rect.width + (rect.x - offsetX);
            updatedRect.x = offsetX;
          } else if (resizeHandle === "right") {
            updatedRect.width = offsetX - rect.x;
          }

          updatedStack[selectedId] = updatedRect;
          setDrawingStack(updatedStack);
          drawFromStack(updatedStack);
        } else {
          let updatedStack = [...drawingStack];
          let updatedRect = { ...rect };
          updatedRect.x += offsetX - mouseX;
          updatedRect.y += offsetY - mouseY;
          updatedStack[selectedId] = updatedRect;
          setDrawingStack(updatedStack);
          setMouseX(offsetX);
          setMouseY(offsetY);
          drawFromStack(updatedStack);
        }
      } else if (tool === "rect") {
        const width = offsetX - drawingData.startX;
        const height = offsetY - drawingData.startY;

        setDrawingData((prevData) => ({ ...prevData, width, height }));

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawFromStack(drawingStack);
        ctx.strokeStyle = "rgba(0, 120, 215, 0.3)";
        ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(drawingData.startX, drawingData.startY, width, height);
      } else if (tool === "ellipse") {
        const width = offsetX - drawingData.startX;
        const height = offsetY - drawingData.startY;

        setDrawingData((prevData) => ({ ...prevData, width, height }));

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawFromStack(drawingStack);
        ctx.strokeStyle = "rgba(0, 120, 215, 0.3)";
        ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
        ctx.lineWidth = 1;
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
    },
    [
      isDrawing,
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

  const handleMouseUp = useCallback(
    (event) => {
      if (!isDrawing) return;

      const ctx = getContext();
      const { offsetX, offsetY } = event;
      const width = offsetX - drawingData.startX;
      const height = offsetY - drawingData.startY;

      if (tool === "rect") {
        if (width === 0 || height === 0) return;

        let rect = new Rectangle(
          [drawingData.startX, drawingData.startY],
          [width, height],
          drawingData.color
        );

        // Update the drawing stack
        let updatedStack =
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
        let updatedStack =
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
        // emitDrawing(socket, { drawingStack: updatedStack, message: "hi" });

        setDrawingData((prev) => ({ ...prev, id: prev.id + 1 }));
      }

      setIsDrawing(false);
      setSelectedId(null);
      setResizeHandle(null);
    },

    [isDrawing, drawingData, tool, getContext, drawingStack, selectedId]
  );

  useEffect(() => {
    drawFromStack(drawingStack);
  }, [drawingStack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", () => setIsDrawing(false));

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", () => setIsDrawing(false));
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
      </div>
      <canvas
        ref={canvasRef}
        width={1680}
        height={740}
        style={{ border: "1px solid black" }}
      ></canvas>
    </div>
  );
};

export default Canvas;
