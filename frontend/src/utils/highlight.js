import { calculateBuffer } from "./gap";

function cc(offsetX, offsetY, x, y, width, height, setIsCustomCursor) {
  const handleSize = 7;
  let cursor = "auto";
  let customCursor = false;

  const position = {
    bottomRight:
      offsetX >= x + width - handleSize && offsetY >= y + height - handleSize, //if x = 100, y = 100, width = 200, height = 150, and handleSize = 7,
    //The bottom-right corner range is (293, 243) to (300, 300).
    //if offsetX = 295 and offsetY = 245, this condition is true.
    topLeft: offsetX <= x + handleSize && offsetY <= y + handleSize, //the top-left corner range is (100, 100) to (107, 107).
    // if offsetX = 105 and offsetY = 105, this condition is true.
    topRight: offsetX >= x + width - handleSize && offsetY <= y + handleSize, //The top-right corner range is (293, 100) to (300, 107).
    //if offsetX = 295 and offsetY = 105, this condition is true.
    bottomLeft: offsetX <= x + handleSize && offsetY >= y + height - handleSize, //The bottom-left corner range is (100, 243) to (107, 250).
    //if offsetX = 105 and offsetY = 245, this condition is true.
    top: offsetY <= y + handleSize, // top edge range is y = 100 to y = 107.
    //if offsetY = 105 (with any offsetX), this condition is true.
    bottom: offsetY >= y + height - handleSize, //The bottom edge range is y = 243 to y = 250.
    // if offsetY = 245 (with any offsetX), this condition is true.
    left: offsetX <= x + handleSize, //left edge range is x = 100 to x = 107.
    //if offsetX = 105 (with any offsetY), this condition is true.
    right: offsetX >= x + width - handleSize, //The right edge range is x = 293 to x = 300.
    //if offsetX = 295 (with any offsetY), this condition is true.
  };

  switch (true) {
    case position.bottomRight || position.topLeft:
      cursor = "nwse-resize";
      break;
    case position.topRight || position.bottomLeft:
      cursor = "nesw-resize";
      break;
    case position.top || position.bottom:
      cursor = "ns-resize";
      break;
    case position.left || position.right:
      cursor = "ew-resize";
      customCursor = true;
      break;
  }

  setIsCustomCursor(customCursor);
  return cursor;
}
export class highlightRect {
  constructor(ctx) {
    this.ctx = ctx;
  }

  highlightDraw(x, y, height, width, borderWidth) {
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.restore();
  }
  resizeHighlight(ctx, x, y, h, w, gap) {
    this.path = new Path2D();
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    this.gap = gap;
  }
  changeCurser(ctx, x, y, setIsCustomCursor) {
    const isInside = ctx.isPointInStroke(x, y);
    console.log("cc");
    setIsCustomCursor(
      isInside
        ? cc(
            x - this.x,
            y - this.y,
            this.x,
            this.y,
            this.w,
            this.h,
            setIsCustomCursor
          )
        : false
    );
  }
}
