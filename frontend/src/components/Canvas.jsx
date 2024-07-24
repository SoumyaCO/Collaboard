import React, { useState, useRef, useEffect } from "react";
import pen from "../assets/pen.png";
import eraser from "../assets/eraser.png";
import rectangle from "../assets/rectangle.png";

const App = () => {
  // Define color options
  const colors = ["black", "red", "green", "orange", "blue", "yellow"];

  // State variables for tool, color, stroke width, etc.
  const [tool, setTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("red");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [isPressed, setIsPressed] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [drawingData, setDrawingData] = useState({
    tool: tool,
    color: selectedColor,
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  });

  // Canvas and context references
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Set up the canvas and context on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      contextRef.current = ctx;
    }

    const updateCanvasSize = () => {
      canvas.width = canvas.clientWidth; // Set canvas width
      canvas.height = canvas.clientHeight; // Set canvas height
    };

    window.addEventListener("resize", updateCanvasSize); // Update size on resize
    updateCanvasSize(); // Set initial size

    return () => {
      window.removeEventListener("resize", updateCanvasSize); // Clean up
    };
  }, []);

  // Get mouse position relative to canvas
  const getMousePosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // Begin drawing or erasing
  const beginDraw = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button

    const { x, y } = getMousePosition(e);
    setIsPressed(true);
    setDrawingData((prevData) => ({
      ...prevData,
      startX: x,
      startY: y,
    }));

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setImageData(
      ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height) // Save image data
    );
  };

  // Update drawing or erasing based on tool selection
  const updateDraw = (e) => {
    if (!isPressed) return;

    const { x, y } = getMousePosition(e);
    const ctx = contextRef.current;
    const canvas = canvasRef.current;

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      // If the cursor is outside the canvas bounds, stop drawing or erasing
      setIsPressed(false);
      return;
    }

    if (tool === "pen") {
      ctx.strokeStyle = selectedColor; // Set color for pen
      ctx.lineWidth = strokeWidth; // Set stroke width for pen
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke(); // Draw line
    } else if (tool === "rect") {
      const width = x - drawingData.startX;
      const height = y - drawingData.startY;

      ctx.putImageData(imageData, 0, 0); // Restore previous image data
      ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
      ctx.fillRect(drawingData.startX, drawingData.startY, width, height); // Draw rectangle
      ctx.strokeStyle = "rgba(0, 120, 215, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(drawingData.startX, drawingData.startY, width, height); // Stroke rectangle
    } else if (tool === "eraser") {
      const width = x - drawingData.startX;
      const height = y - drawingData.startY;

      ctx.putImageData(imageData, 0, 0); // Restore previous image data

      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(drawingData.startX, drawingData.startY, width, height); // Draw eraser outline

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillRect(drawingData.startX, drawingData.startY, width, height); // Erase content
    }
  };

  // End drawing or erasing
  const endDraw = (e) => {
    if (!isPressed) return;

    const ctx = contextRef.current;
    const { x, y } = getMousePosition(e);

    if (
      x < 0 ||
      x > canvasRef.current.width ||
      y < 0 ||
      y > canvasRef.current.height
    ) {
      // If the cursor is outside the canvas bounds, stop drawing or erasing
      setIsPressed(false);
      return;
    }

    if (tool === "rect") {
      ctx.putImageData(imageData, 0, 0); // Restore previous image data
      ctx.fillStyle = selectedColor;
      ctx.fillRect(
        drawingData.startX,
        drawingData.startY,
        x - drawingData.startX,
        y - drawingData.startY
      ); // Finalize rectangle
    } else if (tool === "eraser") {
      const width = x - drawingData.startX;
      const height = y - drawingData.startY;

      const eraseX = Math.min(drawingData.startX, x);
      const eraseY = Math.min(drawingData.startY, y);
      const eraseWidth = Math.abs(width);
      const eraseHeight = Math.abs(height);

      ctx.clearRect(
        eraseX - strokeWidth / 2,
        eraseY - strokeWidth / 2,
        eraseWidth + strokeWidth,
        eraseHeight + strokeWidth
      ); // Clear area for eraser
    }
    setIsPressed(false); // Stop drawing or erasing
  };

  // Handle mouse leaving the canvas
  const handleMouseOut = () => {
    if (isPressed) {
      const ctx = contextRef.current;
      ctx.putImageData(imageData, 0, 0); // Restore previous image data
      setIsPressed(false); // Stop drawing when mouse leaves canvas
    }
  };
  return (
    <div className="app">
      <div className="tools-and-colors-container">
        <div className="tools">
          <div className="tool pen" onClick={() => setTool("pen")}>
            <img src={pen} alt="pen" />
          </div>
          <div className="tool rectangle" onClick={() => setTool("rect")}>
            <img src={rectangle} alt="rectangle" />
          </div>
          <div className="tool eraser" onClick={() => setTool("eraser")}>
            <img src={eraser} alt="eraser" />
          </div>
        </div>
        <div className="colors">
          {colors.map((color) => (
            <div
              key={color}
              className="color-border"
              onClick={() => setSelectedColor(color)}
            >
              <div className="color" style={{ backgroundColor: color }}></div>
            </div>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={beginDraw}
        onMouseMove={updateDraw}
        onMouseUp={endDraw}
        onMouseOut={handleMouseOut}
      />
    </div>
  );
};

export default App;
