"use client";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const imageToRemove = useRef(null);
  const canvasToLoad = useRef(null);

  useEffect(() => {
    const image = imageToRemove.current;
    const canvas = canvasToLoad.current;
    removeBackground(image, canvas);
  });

  async function removeBackground(image, canvas) {
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
      runtime: "tfjs",
    };
    const segmenter = await bodySegmentation.createSegmenter(
      model,
      segmenterConfig
    );

    const segmentation = await segmenter.segmentPeople(image);
    console.log(image);

    // Convert the segmentation into a mask to darken the background.
    const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
    const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
    const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
      segmentation,
      foregroundColor,
      backgroundColor
    );

    const opacity = 0.8;
    const maskBlurAmount = 3;
    const flipHorizontal = false;
    image;
    // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
    // maskBlurAmount set to 3, this will darken the background and blur the
    // darkened background's edge.
    await bodySegmentation.drawMask(
      canvas,
      image,
      backgroundDarkeningMask,
      opacity,
      maskBlurAmount,
      flipHorizontal
    );
  }
  return (
    <Fragment>
      <Image
        ref={imageToRemove}
        src={"/images/sample-01.jpg"}
        alt="lady"
        height={400}
        width={500}
      />

      <canvas ref={canvasToLoad}></canvas>
    </Fragment>
  );
}
