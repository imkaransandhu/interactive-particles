import * as THREE from "three";
import { TweenLite } from "gsap/TweenMax";

import InteractiveControls from "./controls/InteractiveControls";
import Particles from "./particles/Particles";

const glslify = require("glslify");

import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";

export default class WebGLView {
  constructor(app) {
    this.app = app;

    const addImageButton = document.getElementById("click-photo");

    this.samples = ["./images/sample-02.png", "./images/sample-01.jpg"];

    addImageButton.addEventListener("click", () => {
      // code to be executed when the element is clicked
      const video = document.getElementById("webcam");
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageSrc = canvas.toDataURL("image/png");
      const newImage = new Image();
      newImage.src = imageSrc;

      //console.log(image); // Do something with the captured image
      const canvasToLoad = document.getElementById("canvasToLoad");
      async function removeBackground(img, canvas) {
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
            typeof video !== "undefined" &&
            video !== null &&
            video.readyState === 4
          ) {
            const segmentation = await segmenter.segmentPeople(img, {
              multiSegmentation: true,
              segmentBodyParts: true,
            });

            // Convert the segmentation into a mask to darken the background.
            const foregroundColor = { r: 255, g: 100, b: 200, a: 0 }; //  color for where the person or body part is detected
            const backgroundColor = { r: 0, g: 0, b: 0, a: 255 }; // color or mask where the perosn or body part not detected
            const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
              segmentation,
              foregroundColor,
              backgroundColor
            );

            const opacity = 1;
            const maskBlurAmount = 5;
            const flipHorizontal = true;

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
            //setImageUrl(canvas.toDataURL());
            //setLoading(false);
          } else {
            update();
            throw new Error("Camera is Not working");
          }
        }
        update();
      }
      removeBackground(newImage, canvasToLoad);
      // const ctx = canvasToLoad.getContext("2d");
      // let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // const pixels = imageData.data;
      // const modifiedPixels = new Uint8ClampedArray(pixels.length);
      // // apply Gaussian blur
      // // increase brightness
      // for (let i = 0; i < pixels.length; i += 4) {
      //   // Check if the pixel is black
      //   if (pixels[i] < 50 && pixels[i + 1] < 50 && pixels[i + 2] < 50) {
      //     // Set the alpha value of the pixel to 0 to make it transparent
      //     modifiedPixels[i + 3] = 0;
      //   } else {
      //     // Preserve the red, green, and blue values for non-black pixels

      //     modifiedPixels[i] = pixels[i];
      //     modifiedPixels[i + 1] = pixels[i + 1];
      //     modifiedPixels[i + 2] = pixels[i + 2];

      //     // Preserve the alpha value for non-black pixels

      //     modifiedPixels[i + 3] = pixels[i + 3];
      //   }
      // }

      // const newCanvasImage = document.createElement("canvas");
      // console.log(modifiedPixels.length, pixels.length);
      // newCanvasImage.width = canvasToLoad.width;
      // newCanvasImage.height = canvasToLoad.height;
      // const newImageData = new ImageData(
      //   modifiedPixels,
      //   newCanvasImage.width,
      //   newCanvasImage.height
      // );

      // const newContext = newCanvasImage.getContext("2d");
      // newContext.putImageData(newImageData, 0, 0);
      // // Check if canvas is empty
      // Create a link element
      // Create an image element
      const img = new Image();

      // Set the data URL as the source of the image
      img.src = canvasToLoad.toDataURL("image/png");
      const canvas1 = document.createElement("canvas");
      // When the image is loaded, resize it and download the resized image
      img.onload = () => {
        // Set the desired dimensions for the resized image
        const desiredWidth = 320;
        const desiredHeight = 180;

        // Create a canvas element

        // Set the canvas dimensions to the desired dimensions
        canvas1.width = desiredWidth;
        canvas1.height = desiredHeight;

        // Get a reference to the canvas context
        const context = canvas1.getContext("2d");

        // Draw the resized image on the canvas
        context.drawImage(img, 0, 0, desiredWidth, desiredHeight);

        const clickEvent = new Event("click");
        document.body.dispatchEvent(clickEvent);
        this.samples.push(canvas1.toDataURL("image/png"));
      };

      // Remove the link from the DOM

      // console.log(result);
    });

    this.initThree();
    this.initParticles();
    this.initControls();

    const rnd = ~~(Math.random() * this.samples.length);
    this.goto(rnd);
  }

  initThree() {
    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      2,
      10000
    );
    this.camera.position.z = 500;

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });

    // clock
    this.clock = new THREE.Clock(true);
  }

  initControls() {
    this.interactive = new InteractiveControls(
      this.camera,
      this.renderer.domElement,
      this.app.poseArray
    );
  }

  initParticles() {
    this.particles = new Particles(this);
    this.scene.add(this.particles.container);
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  update() {
    const delta = this.clock.getDelta();

    if (this.particles) this.particles.update(delta);
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
  }

  goto(index) {
    // init next
    if (this.currSample == null) this.particles.init(this.samples[index]);
    // hide curr then init next
    else {
      this.particles.hide(true).then(() => {
        this.particles.init(this.samples[index]);
      });
    }

    this.currSample = index;
  }

  next() {
    if (this.currSample < this.samples.length - 1)
      this.goto(this.currSample + 1);
    else this.goto(0);
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  resize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.fovHeight =
      2 *
      Math.tan((this.camera.fov * Math.PI) / 180 / 2) *
      this.camera.position.z;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.interactive) this.interactive.resize();
    if (this.particles) this.particles.resize();
  }
}
