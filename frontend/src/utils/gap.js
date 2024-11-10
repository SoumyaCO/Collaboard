export function calculateBuffer(width, height, gap) {
  let bufferX = gap; // setting bufferX and bufferY to the value of gap
  let bufferY = gap;
  if (width < 0) {
    bufferX = -gap; //If the width is negative, it sets bufferX to -gap
  }
  if (height < 0) {
    bufferY = -gap;
  }
  return [bufferX, bufferY];
}
