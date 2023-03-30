"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

import * as bodySegmentation from "@tensorflow-models/body-segmentation";
//import * as bodyPix from "@tensorflow-models/body-pix";

import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import Image from "next/image";

export default function Home() {
  const [clones, setClones] = useState(5);
  const canvas = useRef();
  const webcam = useRef();
  const videoToReveal = useRef();
  const imgRef = useRef();
  const newCanvas = useRef();

  useEffect(() => {
    const canvasEl = canvas.current;
    const webcamEl = webcam.current;
    const videoToRevealEl = videoToReveal.current;
    const imgEl = imgRef.current;
    const newCanvasEl = newCanvas.current;
    removeBackground(webcamEl, canvasEl, videoToRevealEl, imgEl);
    // TensorFlow ModalremoveBackground(img, canvas);
    async function removeBackground(
      webcamVideo,
      canvas,
      videoBackground,
      image
    ) {
      const model =
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
      const segmenterConfig = {
        runtime: "tfjs",
      };
      const segmenter = await bodySegmentation.createSegmenter(
        model,
        segmenterConfig
      );

      async function update() {
        if (
          typeof webcamVideo !== "undefined" &&
          webcamVideo !== null &&
          webcamVideo.video.readyState === 4
        ) {
          const segmentation = await segmenter.segmentPeople(
            webcamVideo.video,
            {
              multiSegmentation: true,
              segmentBodyParts: true,
            }
          );

          // Convert the segmentation into a mask to darken the background.
          const foregroundColor = { r: 0, g: 0, b: 0, a: 0 }; //  color for where the person or body part is detected
          const backgroundColor = { r: 0, g: 0, b: 0, a: 255 }; // color or mask where the perosn or body part not detected
          const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
            segmentation,

            foregroundColor,
            backgroundColor
          );

          const opacity = 1;
          const maskBlurAmount = 0;
          const flipHorizontal = true;

          const canvas1 = document.createElement("canvas");
          const canvas2 = document.createElement("canvas");
          const canvas3 = document.createElement("canvas");

          settingHeightWidth(canvas1, canvas);
          settingHeightWidth(canvas3, canvas);
          settingHeightWidth(canvas2, canvas);
          // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
          // maskBlurAmount set to 3, this will darken the background and blur the
          // darkened background's edge.
          const allData = await bodySegmentation.drawMask(
            canvas1,
            videoBackground,
            backgroundDarkeningMask,
            opacity,
            maskBlurAmount,
            flipHorizontal
          );

          const context = canvas1.getContext("2d");
          const imageData = context.getImageData(
            0,
            0,
            canvas1.width,
            canvas1.height
          );
          const pixels = imageData.data;

          //console.log(selectedPixels, imageData);

          // cloneCanvas(pixels, canvas1, canvas, -20, 20, 255);
          cloneCanvas(pixels, canvas2, canvas1, -20, 20, 200);
          cloneCanvas(pixels, canvas3, canvas1, -30, 30, 150);

          const ctx = canvas.getContext("2d");
          const ctx1 = canvas1.getContext("2d");
          const ctx2 = canvas2.getContext("2d");
          const ctx3 = canvas3.getContext("2d");
          // Draw canvas1 and canvas2 onto combinedCanvas
          ctx.drawImage(canvas1, 0, 0);
          ctx.drawImage(canvas2, 0, 0);
          ctx.drawImage(canvas3, 0, 0);

          videoBackground.play();
        } else {
          console.error("Waiting to camera to load");
        }

        requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }
  }, []);

  function settingHeightWidth(toCanvas, fromCanvas) {
    toCanvas.width = fromCanvas.width;
    toCanvas.height = fromCanvas.height;
  }

  function cloneCanvas(pixels, newCanvas, canvas, x, y, color) {
    const modifiedPixels = new Uint8ClampedArray(pixels.length);

    for (let i = 0; i < pixels.length; i += 4) {
      // Check if the pixel is black
      if (pixels[i] === 0 && pixels[i + 1] === 0 && pixels[i + 2] === 0) {
        // Set the alpha value of the pixel to 0 to make it transparent
        modifiedPixels[i + 3] = 0;
      } else {
        // Preserve the red, green, and blue values for non-black pixels
        console.log("dfdfd");

        modifiedPixels[i] = color - pixels[i];
        modifiedPixels[i + 1] = color - pixels[i + 1];
        modifiedPixels[i + 2] = color - pixels[i + 2];
        // Preserve the alpha value for non-black pixels
        modifiedPixels[i + 3] = pixels[i + 3];
      }
    }

    const newImageData = new ImageData(
      modifiedPixels,
      canvas.width,
      canvas.height
    );
    //console.log(selectedPixels, imageData);
    const newContext = newCanvas.getContext("2d");
    newContext.putImageData(newImageData, x, y);
  }

  return (
    <Fragment>
      <canvas
        ref={canvas}
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          zIndex: "-1",
        }}
        id={"canvasToLoad"}
      ></canvas>

      <canvas
        ref={newCanvas}
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: "-1",
        }}
        id={"canvasToLoad"}
      ></canvas>

      <Image
        ref={imgRef}
        src="/images/sample-12 - Copy.png"
        alt="value photo"
        width={640}
        height={480}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: "0.3",
        }}
      />

      <Webcam
        id="webcam"
        ref={webcam}
        width={640}
        height={480}
        style={{
          visibility: "hidden",
          zIndex: "-12",
          position: "absolute",
          left: 0,
          top: 0,
        }}
      />

      <video
        ref={videoToReveal}
        id="myVideo"
        width="640"
        height="480"
        controls
        src="video/particles.mp4"
        loop
        style={{
          visibility: "hidden",
          position: "absolute",
          zIndex: "-12",
          top: 0,
          left: 0,
        }}
      ></video>
    </Fragment>
  );
}
