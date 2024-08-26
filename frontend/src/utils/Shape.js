import { makeid } from "../utils/MakeId";
class Shape {
  constructor(origin, spread) {
    this.version = 1;
    this.id = makeid(10); // Utility method to generate a unique ID
    [this.x, this.y] = origin;
    [this.spreadX, this.spreadY] = spread;
  }

  draw(ctx) {
    
  }

  clear(ctx) {
  }
}

export default Shape;
