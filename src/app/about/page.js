"use client";
import * as bodyPix from "@tensorflow-models/body-pix";
import Image from "next/image";
import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    const loadImage = () => {
      const img = document.querySelector(".rm-img");
      //img.src = "http://localhost:3000/images/sample-10.jpg";

      const canvas = document.querySelector(".rm-background");
      const ctx = canvas.getContext("2d");

      img.addEventListener("load", () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        backgroundRemoval();
      });

      console.log("adfdsf");
    };

    const backgroundRemoval = async () => {
      const canvas = document.querySelector(".rm-background");

      const net = await bodyPix.load({
        architecture: "ResNet50",
        outputStride: 32,
        quantBytes: 4,
      });
      const segmentation = await net.segmentPerson(canvas, {
        internalResolution: "medium",
        segmentationThreshold: 0.7,
        scoreTreshold: 0.7,
      });

      const ctx = canvas.getContext("2d");
      const { data: imgData } = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const newImg = ctx.createImageData(canvas.width, canvas.height);
      const newImgData = newImg.data;

      segmentation.data.forEach((segment, i) => {
        if (segment == 1) {
          newImgData[i * 4] = imgData[i * 4];
          newImgData[i * 4 + 1] = imgData[i * 4 + 1];
          newImgData[i * 4 + 2] = imgData[i * 4 + 2];
          newImgData[i * 4 + 3] = imgData[i * 4 + 3];
        }
      });

      ctx.putImageData(newImg, 0, 0);
    };

    loadImage();
  }, []);

  return (
    <div>
      <Image
        className="rm-img"
        src="/images/sample-10.jpg"
        alt="dfd"
        height={100}
        width={100}
      />
      <canvas className="rm-background"></canvas>
    </div>
  );
}
