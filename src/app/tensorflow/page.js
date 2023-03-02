"use client";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
// import '@tensorflow/tfjs-backend-wasm';

export default function TensorFLow() {
  const videoRef = useRef(null);
  //const canvasRef = useRef(null);

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
      console.log("sfds");
    }, 100);
  }

  getPosePoints();

  async function runDetector(detector) {
    if (
      typeof videoRef.current !== "undefined" &&
      videoRef.current !== null &&
      videoRef.current.video.readyState === 4
    ) {
      const video = videoRef.current.video;
      const poses = await detector.estimatePoses(video);
      console.log(poses);
    }
  }

  return (
    <div>
      <Webcam
        ref={videoRef}
        style={{ display: "none", height: "300px", width: "300px" }}
      />
    </div>
  );
}
