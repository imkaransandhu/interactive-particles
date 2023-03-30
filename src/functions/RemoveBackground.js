import * as bodySegmentation from "@tensorflow-models/body-segmentation";

// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";

import CreateClones from "./CreateClones";

export default async function RemoveBackground(
  canvasEl,
  webcamEl,
  videoToRevealEl,
  newCanvasEl1,
  newCanvasEl2,
  newCanvasEl3,
  newCanvasEl4,
  newCanvasEl5
) {
  const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
  const segmenterConfig = {
    runtime: "tfjs",
  };
  const segmenter = await bodySegmentation.createSegmenter(
    model,
    segmenterConfig
  );

  async function update() {
    if (
      typeof webcamEl !== "undefined" &&
      webcamEl !== null &&
      webcamEl.video.readyState === 4
    ) {
      const segmentation = await segmenter.segmentPeople(webcamEl.video, {
        multiSegmentation: true,
        segmentBodyParts: true,
      });

      // Convert the segmentation into a mask to darken the background.
      const foregroundColor = { r: 0, g: 0, b: 0, a: 0 }; //  color for where the person or body part is detected
      const backgroundColor = { r: 0, g: 0, b: 0, a: 255 }; // color or mask where the perosn or body part not detected
      const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
        segmentation,
        foregroundColor,
        backgroundColor
      );

      const opacity = 1;
      const maskBlurAmount = 10;
      const flipHorizontal = true;

      // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
      // maskBlurAmount set to 3, this will darken the background and blur the
      // darkened background's edge.
      const allData = await bodySegmentation.drawMask(
        canvasEl,
        videoToRevealEl,
        backgroundDarkeningMask,
        opacity,
        maskBlurAmount,
        flipHorizontal
      );

      const context = canvasEl.getContext("2d");
      const imageData = context.getImageData(
        0,
        0,
        canvasEl.width,
        canvasEl.height
      );
      const pixels = imageData.data;

      setTimeout(() => {
        CreateClones(pixels, canvasEl, 225, 0, newCanvasEl1);
      }, 400);

      setTimeout(() => {
        CreateClones(pixels, canvasEl, 235, 0, newCanvasEl2);
      }, 300);
      setTimeout(() => {
        CreateClones(pixels, canvasEl, 245, 0, newCanvasEl3);
      }, 200);
      setTimeout(() => {
        CreateClones(pixels, canvasEl, 255, 0, newCanvasEl4);
      }, 100);

      CreateClones(pixels, canvasEl, 255, 50, newCanvasEl5);

      videoToRevealEl.play();
    } else {
      console.error("Waiting to camera to load");
    }

    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
