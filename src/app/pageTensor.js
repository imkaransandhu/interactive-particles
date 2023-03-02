"use client";

import App from "./scripts/App";
import { Fragment, useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import Webcam from "react-webcam";
// import '@tensorflow/tfjs-backend-wasm';

export default function Home() {
  useEffect(() => {
    window.app = new App();
    window.app.init();
  }, []);

  const videoRef = useRef(null);
  const [poseArray, setPoseArray] = useState([]);

  async function getPosePoints() {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
    setInterval(() => {
      runDetector(detector);
      console.log("karan");
    }, 100);
  }

  async function runDetector(detector) {
    if (
      typeof videoRef.current !== "undefined" &&
      videoRef.current !== null &&
      videoRef.current.video.readyState === 4
    ) {
      const video = videoRef.current.video;
      const poses = await detector.estimatePoses(video);
      setPoseArray([...poseArray, poses]);
      console.log(poses);
    }
  }
  getPosePoints();
  return (
    <Fragment>
      <div className="container"></div>
      <h1 className="interactive-wall">Interactive Wall</h1>
      <Webcam
        style={{ display: "none", height: "300px", width: "300px" }}
        ref={videoRef}
      />
    </Fragment>
  );
}
