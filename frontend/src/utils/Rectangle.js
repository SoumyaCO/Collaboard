import Shape from "../utils/Shape";

class Rectangle extends Shape {
  constructor(origin, spread, color) {
    super(origin, spread);
    [this.width, this.height] = spread;
    this.color = color;
    this.strokeWidth = 2;
    this.bufferX = 0;
    this.bufferY = 0;
  }

  drawRectangle(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // clearRectangular(ctx) {
  //   [this.bufferX, this.bufferY] = this.calculateBuffer(this.width, this.height);

  //   ctx.clearRect(
  //     this.x - this.bufferX,
  //     this.y - this.bufferY,
  //     this.width + this.bufferX * 2,
  //     this.height + this.bufferY * 2
  //   );
  // }

  calculateBuffer(width, height) {
    let bufferX = this.strokeWidth;
    let bufferY = this.strokeWidth;

    if (width < 0) {
      bufferX = -this.strokeWidth;
    }
    if (height < 0) {
      bufferY = -this.strokeWidth;
    }
    return [bufferX, bufferY];
  }
}

export default Rectangle;
