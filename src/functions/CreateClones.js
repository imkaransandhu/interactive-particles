export default function CreateClones(pixels, canvas, color, x, canvasToCreate) {
  const modifiedPixels = new Uint8ClampedArray(pixels.length);
  // const color = Math.floor(Math.random() * 151) + 100;
  for (let i = 0; i < pixels.length; i += 4) {
    // Check if the pixel is black
    if (pixels[i] < 50 && pixels[i + 1] < 50 && pixels[i + 2] < 50) {
      // Set the alpha value of the pixel to 0 to make it transparent
      modifiedPixels[i + 3] = 0;
    } else {
      // Preserve the red, green, and blue values for non-black pixels

      modifiedPixels[i] = pixels[i];
      modifiedPixels[i + 1] = pixels[i + 1];
      modifiedPixels[i + 2] = pixels[i + 2];

      // Preserve the alpha value for non-black pixels

      if (x !== 0) {
        modifiedPixels[i + 3] = pixels[i + 3];
      } else {
        modifiedPixels[i + 3] = color - 130;
      }
    }
  }

  canvasToCreate.width = canvas.width;
  canvasToCreate.height = canvas.height;

  const newImageData = new ImageData(
    modifiedPixels,
    canvasToCreate.width,
    canvasToCreate.height
  );
  const newContext = canvasToCreate.getContext("2d");
  newContext.putImageData(newImageData, 0, 0);
}
