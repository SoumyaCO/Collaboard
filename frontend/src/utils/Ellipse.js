import Shape from "../utils/Shape";

class Ellipse extends Shape {
  constructor(origin, spread, color) {
    super(origin, spread);
    [this.spreadX, this.spreadY] = spread; // Use spreadX and spreadY to match Shape class
    this.color = color;
    this.strokeWidth = 2;
    this.bufferX = 0;
    this.bufferY = 0;
  }

  drawEllipseFill(ctx) {
    // Pass ctx as a parameter
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.spreadX,
      this.y + this.spreadY,
      Math.abs(this.spreadX),
      Math.abs(this.spreadY),
      0, // Rotation angle, set to 0 if not needed
      0,
      Math.PI * 2 // Full circle
    );
    ctx.fill();
  }
}

export default Ellipse;
