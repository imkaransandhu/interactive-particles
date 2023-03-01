/* eslint-disable @next/next/no-img-element */
"use client";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Home() {
  const initialImage = useRef(null);
  const canvasToLoad = useRef(null);
  const removedBgImg = useRef(null);

  const [imageUrl, setImageUrl] = useState("/images/sample-04.jpg");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const image = initialImage.current;
    const canvas = canvasToLoad.current;
    const rmBgImg = removedBgImg.current;
    removeBackground(image, canvas, rmBgImg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function removeBackground(img, canvas) {
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
      runtime: "tfjs",
    };
    const segmenter = await bodySegmentation.createSegmenter(
      model,
      segmenterConfig
    );

    const segmentation = await segmenter.segmentPeople(img, {
      multiSegmentation: false,
      segmentBodyParts: true,
    });

    // Convert the segmentation into a mask to darken the background.
    const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
    const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
    const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
      segmentation,
      foregroundColor,
      backgroundColor
    );

    const opacity = 1;
    const maskBlurAmount = 3;
    const flipHorizontal = false;

    // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
    // maskBlurAmount set to 3, this will darken the background and blur the
    // darkened background's edge.
    await bodySegmentation.drawMask(
      canvas,
      img,
      backgroundDarkeningMask,
      opacity,
      maskBlurAmount,
      flipHorizontal
    );
    setImageUrl(canvas.toDataURL());
    setLoading(false);
  }

  return (
    <Fragment>
      <img
        ref={initialImage}
        src={"/images/sample-10.avif"}
        alt="lady"
        height={"auto"}
        width={"auto"}
      />
      <canvas style={{ display: "none" }} ref={canvasToLoad}></canvas>
      {loading ? (
        <h1>Loading, please wait ...</h1>
      ) : (
        <Image
          style={{ display: "block" }}
          src={imageUrl}
          ref={removedBgImg}
          alt="lady"
          height={400}
          width={500}
        />
      )}
    </Fragment>
  );
}
