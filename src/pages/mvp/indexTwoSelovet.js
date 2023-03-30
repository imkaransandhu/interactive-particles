"use client";
import { Fragment, useEffect, useRef } from "react";
import Webcam from "react-webcam";

import * as bodySegmentation from "@tensorflow-models/body-segmentation";
//import * as bodyPix from "@tensorflow-models/body-pix";

import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import Image from "next/image";

export default function Home() {
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

          // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
          // maskBlurAmount set to 3, this will darken the background and blur the
          // darkened background's edge.
          const allData = await bodySegmentation.drawMask(
            canvas,
            videoBackground,
            backgroundDarkeningMask,
            opacity,
            maskBlurAmount,
            flipHorizontal
          );

          const context = canvas.getContext("2d");
          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const pixels = imageData.data;

          const modifiedPixels = new Uint8ClampedArray(pixels.length);
          for (let i = 0; i < pixels.length; i += 4) {
            // Check if the pixel is black
            if (pixels[i] === 0 && pixels[i + 1] === 0 && pixels[i + 2] === 0) {
              // Set the alpha value of the pixel to 0 to make it transparent
              modifiedPixels[i + 3] = 0;
            } else {
              // Preserve the red, green, and blue values for non-black pixels
              modifiedPixels[i] = 255 - pixels[i];
              modifiedPixels[i + 1] = 255 - pixels[i + 1];
              modifiedPixels[i + 2] = 255 - pixels[i + 2];
              // Preserve the alpha value for non-black pixels
              modifiedPixels[i + 3] = pixels[i + 3];
            }
          }
          //console.log(selectedPixels, imageData);

          newCanvasEl.width = canvas.width;
          newCanvasEl.height = canvas.height;
          const newContext = newCanvasEl.getContext("2d");

          const newImageData = new ImageData(
            modifiedPixels,
            canvas.width,
            canvas.height
          );
          newContext.putImageData(newImageData, -20, 20);

          videoBackground.play();
        } else {
          console.error("Waiting to camera to load");
        }

        requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }
  }, []);

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
