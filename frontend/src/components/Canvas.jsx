import React, { useState, useRef, useEffect } from "react";
import pen from "../assets/pen.png";
import eraser from "../assets/eraser.png";
import rectangle from "../assets/rectangle.png";

const App = () => {
  const [tool, setTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("red");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [drawingData, setDrawingData] = useState({
    tool: tool,
    color: selectedColor,
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
    strokeWidth: strokeWidth,
    bufferX: 0,
    bufferY: 0,
  });
  const canvasRef = useRef(null);

  const getMousePosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });

    if (ctx) {
      const handleMouseDown = (event) => {
        const { x, y } = getMousePosition(event);
        setIsDrawing(true);
        setDrawingData((prevData) => ({
          ...prevData,
          startX: x,
          startY: y,
        }));
        setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      };

      const handleMouseMove = (event) => {
        if (isDrawing) {
          const { x, y } = getMousePosition(event);

          // Clear the canvas or restore to a previous state if necessary
          ctx.putImageData(imageData, 0, 0);

          const width = x - drawingData.startX;
          const height = y - drawingData.startY;
          setDrawingData((prevData) => ({
            ...prevData,
            width,
            height,
          }));

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(imageData, 0, 0);

          if (tool === "rect") {
            ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
            ctx.fillRect(drawingData.startX, drawingData.startY, width, height);
          } else if (tool === "eraser") {
            ctx.strokeStyle = "black";
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(
              drawingData.startX,
              drawingData.startY,
              width,
              height
            );
          } else if (tool === "pen") {
            // pen drawing logic 
          }
        }
      };

      const handleMouseUp = (event) => {
        if (isDrawing) {
          const { x, y } = getMousePosition(event);
          setIsDrawing(false);
          const width = x - drawingData.startX;
          const height = y - drawingData.startY;
          setDrawingData((prevData) => ({
            ...prevData,
            width,
            height,
          }));

          if (tool === "rect") {
            ctx.fillStyle = selectedColor;
            ctx.fillRect(
                    drawingData.startX,
              drawingData.startY,
              drawingData.width,
              drawingData.height,
            );
          } else if (tool === "eraser") {
    
          

            const { bufferX, bufferY } = calculateBuffer(drawingData, drawingData.width, drawingData.height);
            
            ctx.clearRect(
              drawingData.startX - bufferX - strokeWidth / 2,
              drawingData.startY - bufferY - strokeWidth / 2,
              drawingData.width + bufferX * 2 + strokeWidth,
              drawingData.height + bufferY * 2 + strokeWidth
            );
          }
        }
      };

      const handleMouseOut = () => {
        setIsDrawing(false);
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseout", handleMouseOut);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [tool, selectedColor, strokeWidth, isDrawing, imageData, drawingData]);

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
          <div className="color-border" onClick={() => setSelectedColor("red")}>
            <div className="color red"></div>
          </div>
          <div
            className="color-border"
            onClick={() => setSelectedColor("blue")}
          >
            <div className="color blue"></div>
          </div>
          <div
            className="color-border"
            onClick={() => setSelectedColor("green")}
          >
            <div className="color green"></div>
          </div>
          <div
            className="color-border"
            onClick={() => setSelectedColor("yellow")}
          >
            <div className="color yellow"></div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} id="canvas" width="500" height="500"></canvas>
    </div>
  );
};

export default App;
