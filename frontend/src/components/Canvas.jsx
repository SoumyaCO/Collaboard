import React, { useRef, useEffect, useState } from "react";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [drawingStack, setDrawingStack] = useState([]); // Store rectangles
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const borderGap = 30; // Gap between the fill and the border
  const borderWidth = 3; // Width of the rectangle border

  const isMouseOverBorder = (offsetX, offsetY, rect) => {
    // Check if the mouse is within the border area
    return (
      (offsetX >= rect.x &&
        offsetX <= rect.x + rect.width &&
        ((offsetY >= rect.y && offsetY <= rect.y + borderWidth) ||
          (offsetY >= rect.y + rect.height - borderWidth &&
            offsetY <= rect.y + rect.height))) ||
      (offsetY >= rect.y &&
        offsetY <= rect.y + rect.height &&
        ((offsetX >= rect.x && offsetX <= rect.x + borderWidth) ||
          (offsetX >= rect.x + rect.width - borderWidth &&
            offsetX <= rect.x + rect.width)))
    );
  };

  const handleMouseMove = (event) => {
    const { offsetX, offsetY } = event;
    const canvas = canvasRef.current;
    let cursor = "default";

    // Check if the mouse is over any rectangle's border
    drawingStack.forEach((rect) => {
      if (isMouseOverBorder(offsetX, offsetY, rect)) {
        cursor = "pointer"; // Change cursor for border hover
      }
    });

    // Update the canvas cursor style
    canvas.style.cursor = cursor;
  };

  const handleMouseDown = (event) => {
    const { offsetX, offsetY } = event;
    setIsDrawing(true);
    setStartPoint({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = (event) => {
    const { offsetX, offsetY } = event;
    setIsDrawing(false);

    if (startPoint) {
      const newRect = {
        x: startPoint.x,
        y: startPoint.y,
        width: offsetX - startPoint.x,
        height: offsetY - startPoint.y,
      };
      setDrawingStack([...drawingStack, newRect]);
      drawCanvas();
    }
    setStartPoint(null);
  };

  const handleMouseMoveWhileDrawing = (event) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = event;
    drawCanvas(offsetX, offsetY);
  };

  const drawCanvas = (currentX, currentY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw existing rectangles with gap
    drawingStack.forEach((rect) => {
      ctx.fillStyle = "rgba(0, 150, 255, 0.3)"; // Light blue fill color
      ctx.fillRect(
        rect.x + borderGap,
        rect.y + borderGap,
        rect.width - 2 * borderGap,
        rect.height - 2 * borderGap
      ); // Fill rectangle with gap
      ctx.strokeStyle = "black"; // Border color
      ctx.lineWidth = borderWidth; // Border width
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height); // Draw border
    });

    // Draw the current rectangle being created with gap
    if (startPoint && currentX && currentY) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Light red fill color
      ctx.fillRect(
        startPoint.x + borderGap,
        startPoint.y + borderGap,
        currentX - startPoint.x - 2 * borderGap,
        currentY - startPoint.y - 2 * borderGap
      );
      ctx.strokeStyle = "red"; // Temporary border color
      ctx.lineWidth = borderWidth; // Border width
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        currentX - startPoint.x,
        currentY - startPoint.y
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", () => {
      setIsDrawing(false);
    });
    canvas.addEventListener("mousemove", handleMouseMoveWhileDrawing);
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", () => {
        setIsDrawing(false);
      });
      canvas.removeEventListener("mousemove", handleMouseMoveWhileDrawing);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: "1px solid black" }}
    />
  );
};

export default CanvasComponent;
