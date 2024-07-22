import React, { useState, useRef, useEffect } from "react";
import pen from "../assets/pen.png";
import eraser from "../assets/eraser.png";
import rectangle from "../assets/rectangle.png";

const App = () => {
  const colors = ["black", "red", "green", "orange", "blue", "yellow"];
  

  const [tool, setTool] = useState("pen");
  // State to keep track of the current drawing tool

  const [selectedColor, setSelectedColor] = useState("red");
  // State to keep track of the currently selected color

  const [strokeWidth, setStrokeWidth] = useState(5);
  // State to keep track of the stroke width for the pen tool

  const [isPressed, setIsPressed] = useState(false);
  // State to determine if the mouse button is pressed

  const [imageData, setImageData] = useState(null);
  // State to store the image data of the canvas for undo functionality

  const [drawingData, setDrawingData] = useState({
    tool: tool,
    color: selectedColor,
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  });
  // State to hold the drawing data, including tool type, color, and coordinates

  const canvasRef = useRef(null);
  // Reference to the canvas element

  const contextRef = useRef(null);
  // Reference to the 2D drawing context of the canvas

  const getMousePosition = (event) => {
    // Function to get the mouse position relative to the canvas
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const beginDraw = (e) => {
    // Function to start drawing on the canvas when the mouse button is pressed
    if (e.button !== 0) return; // Only proceed if the left mouse button is pressed

    const { x, y } = getMousePosition(e);
    setIsPressed(true);
    setDrawingData((prevData) => ({
      ...prevData,
      startX: x,
      startY: y,
    }));

    const ctx = contextRef.current;
    ctx.beginPath(); // Start a new path for drawing
    ctx.moveTo(x, y); // Move the drawing cursor to the initial mouse position
    setImageData(
      ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    );
    // Save the current state of the canvas for undo functionality
  };

  const updateDraw = (e) => {
    // Function to update the drawing on the canvas as the mouse moves
    if (!isPressed) return; // Only update if the mouse button is pressed

    const { x, y } = getMousePosition(e);
    const ctx = contextRef.current;

    if (tool === "pen") {
      ctx.strokeStyle = selectedColor; // Set the color of the stroke
      ctx.lineWidth = strokeWidth; // Set the width of the stroke
      ctx.lineCap = "round"; // Set the end cap style of the stroke
      ctx.lineJoin = "round"; // Set the join style of the stroke
      ctx.lineTo(x, y); // Draw a line to the new mouse position
      ctx.stroke(); // Apply the stroke to the canvas
    } else if (tool === "rect") {
      const width = x - drawingData.startX;
      const height = y - drawingData.startY;

      ctx.putImageData(imageData, 0, 0); // Restore the previous state of the canvas
      ctx.fillStyle = "rgba(0, 120, 215, 0.3)"; // Set the color for the rectangle preview
      ctx.fillRect(drawingData.startX, drawingData.startY, width, height); // Draw the rectangle preview
      ctx.strokeStyle = "rgba(0, 120, 215, 0.6)"; // Set the border color for the rectangle
      ctx.lineWidth = 2; // Set the border width
      ctx.setLineDash([]); // Set a solid border line
      ctx.strokeRect(drawingData.startX, drawingData.startY, width, height); // Draw the rectangle border
    } else if (tool === "eraser") {
      const width = x - drawingData.startX;
      const height = y - drawingData.startY;

      ctx.putImageData(imageData, 0, 0); // Restore the previous state of the canvas

      // Draw the dashed border to indicate the area to be erased
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; // Set the border color for the eraser area
      ctx.lineWidth = 1; // Set the border width
      ctx.setLineDash([5, 5]); // Set dashed border style
      ctx.strokeRect(drawingData.startX, drawingData.startY, width, height); // Draw the dashed border

      // Draw the transparent preview for the area to be erased
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Set the color for the eraser preview
      ctx.fillRect(drawingData.startX, drawingData.startY, width, height); // Draw the eraser preview
    }
  };

  const endDraw = (e) => {
    // Function to finalize the drawing or erasing when the mouse button is released
    if (tool === "rect" && isPressed) {
      const { x, y } = getMousePosition(e);
      const ctx = contextRef.current;
      setIsPressed(false);

      ctx.putImageData(imageData, 0, 0); // Restore the previous state of the canvas
      ctx.fillStyle = selectedColor; // Set the final fill color for the rectangle
      ctx.fillRect(
        drawingData.startX,
        drawingData.startY,
        x - drawingData.startX,
        y - drawingData.startY
      ); // Draw the final rectangle
    } else if (tool === "eraser") {
      const { x, y } = getMousePosition(e);
      const ctx = contextRef.current;
      setIsPressed(false);

      const width = x - drawingData.startX;
      const height = y - drawingData.startY;

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Set the color for the eraser preview
      ctx.fillRect(drawingData.startX, drawingData.startY, width, height); // Draw the eraser preview

      // Calculate buffer to ensure proper erasure area
      const calculateBuffer = (width, height) => {
        let bufferX = strokeWidth;
        let bufferY = strokeWidth;

        if (width < 0) {
          bufferX = -strokeWidth;
        }

        if (height < 0) {
          bufferY = -strokeWidth;
        }

        return { bufferX, bufferY };
      };

      const { bufferX, bufferY } = calculateBuffer(width, height);

      // Clear the specified rectangle area from the canvas with a buffer
      ctx.clearRect(
        drawingData.startX - bufferX - strokeWidth / 2,
        drawingData.startY - bufferY - strokeWidth / 2,
        Math.abs(width) + bufferX * 2 + strokeWidth,
        Math.abs(height) + bufferY * 2 + strokeWidth
      );
    } else {
      setIsPressed(false); // Release the press state if no specific tool action
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800; // Set canvas width
    canvas.height = 800; // Set canvas height
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    // Get the 2D drawing context of the canvas

    if (ctx) {
      contextRef.current = ctx; // Store the context reference
    }
  }, [selectedColor, strokeWidth]); // Reinitialize the canvas context when color or stroke width changes

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
        onMouseDown={beginDraw}
        onMouseMove={updateDraw}
        onMouseUp={endDraw}
      />
    </div>
  );
};

export default App;
