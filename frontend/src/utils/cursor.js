export const updateCursor = (offsetX, offsetY, rect, setIsCustomCursor) => {
  const handleSize = 7;
  let cursor = "auto";
  let customCursor = false;
  //"nwse-resize": Diagonal resizing (bottom-right and top-left corners).
  //"nesw-resize": Diagonal resizing (bottom-left and top-right corners).
  //"ns-resize": Vertical resizing (top and bottom edges).
  //"ew-resize": Horizontal resizing (left and right edges).
  //"auto": Default cursor when not near any edges.
  if (
    offsetX >= rect.x + rect.width - handleSize &&
    offsetX <= rect.x + rect.width &&
    offsetY >= rect.y + rect.height - handleSize &&
    offsetY <= rect.y + rect.height
  ) {
    cursor = "nwse-resize";
  } else if (offsetX <= rect.x + handleSize && offsetY <= rect.y + handleSize) {
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
    offsetX <= rect.x + handleSize && // Mouse is near the left edge
    offsetY >= rect.y + handleSize && // Mouse is below the top edge
    offsetY <= rect.y + rect.height - handleSize // Mouse is above the bottom edge
  ) {
    cursor = "ew-resize";
  } else if (
    offsetX >= rect.x + rect.width - handleSize && // Mouse is near the right edge
    offsetY >= rect.y + handleSize && // Mouse is below the top edge
    offsetY <= rect.y + rect.height - handleSize // Mouse is above the bottom edge
  ) {
    cursor = "ew-resize";
    customCursor = true;
  }

  setIsCustomCursor(customCursor);
  return cursor;
};
//ex : x: 100 (left position)
//y: 100 (top position)
//width: 200
//height: 150
//Mouse at (290, 240):
// Right edge: rect.x + rect.width = 100 + 200 = 300
// Bottom edge: rect.y + rect.height = 100 + 150 = 250
// Handle size: 8
// Condition :
// offsetX (290) is between 292 (300 - 8) and 300 (right edge).
// offsetY (240) is between 242 (250 - 8) and 250 (bottom edge).
// Result: The cursor changes to "nwse-resize".
