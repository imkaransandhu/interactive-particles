import * as THREE from "three";

import TouchTexture from "./TouchTexture";

const glslify = require("glslify");

import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";

export default class PersonParticles {
  constructor(webgl) {
    this.webgl = webgl;
    this.container = new THREE.Object3D();
  }

  init(src) {
    const img = document.getElementById("webcam");
    const canvas = document.getElementById("canvasToLoad");
    const newVideoEl = document.createElement("video");
    newVideoEl.src = "./video/particles.mp4";

    newVideoEl.height = 480;
    newVideoEl.width = 640;

    removeBackground(img, canvas, newVideoEl);
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
          typeof img !== "undefined" &&
          img !== null &&
          img.readyState === 4
        ) {
          const segmentation = await segmenter.segmentPeople(img, {
            multiSegmentation: true,
            segmentBodyParts: true,
          });
          newVideoEl.play();
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
          console.error("Loading CAmera");
        }
        requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }

    document.querySelector(".container").style.backgroundColor = "black";

    canvas.width = 320;
    canvas.height = 180;

    // Create a media stream from the canvas
    const stream = canvas.captureStream();

    const video = document.getElementById("myVideo");
    // Set the media stream as the source of the video element
    video.srcObject = stream;

    // Set the width of the video element to be equal to the width of the canvas
    // Play the video
    //video.play();

    //const video = document.getElementById("webcam");
    video.height = 180;
    video.width = 320;
    video.muted = true;
    video.loop = true;
    video.setAttribute("crossorigin", "anonymous");
    video.addEventListener("canplay", () => {
      this.texture = new THREE.VideoTexture(video);
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.format = THREE.RGBFormat;

      this.width = 320;
      this.height = 180;

      this.initPoints(false);
      this.initHitArea();
      this.initTouch();
      this.resize();
      this.show();
      video.play();
    });
  }

  initPoints(discard) {
    this.numPoints = this.width * this.height;

    let numVisible = this.numPoints;
    let threshold = 0;
    let originalColors;

    if (discard) {
      // discard pixels darker than threshold #22
      numVisible = 0;
      threshold = 34;
      console.log(this.texture);

      const video = this.texture.image;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = this.width;
      canvas.height = this.height;
      ctx.scale(1, -1);
      ctx.drawImage(video, 0, 0, this.width, this.height * -1);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      originalColors = Float32Array.from(imgData.data);

      for (let i = 0; i < this.numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++;
      }

      // console.log('numVisible', numVisible, this.numPoints);
    }

    const uniforms = {
      uTime: { value: 0 },
      uRandom: { value: 1.0 },
      uDepth: { value: 2.0 },
      uSize: { value: 2.6 },
      uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
      uTexture: { value: this.texture },
      uTouch: { value: null },
    };

    const material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader: glslify(require("../../../shaders/particle.vert")),
      fragmentShader: glslify(require("../../../shaders/particle.frag")),
      depthTest: false,
      transparent: true,
      // blending: THREE.AdditiveBlending
    });

    const geometry = new THREE.InstancedBufferGeometry();

    // positions
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    geometry.addAttribute("position", positions);

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXYZ(0, 0.0, 0.0);
    uvs.setXYZ(1, 1.0, 0.0);
    uvs.setXYZ(2, 0.0, 1.0);
    uvs.setXYZ(3, 1.0, 1.0);
    geometry.addAttribute("uv", uvs);

    // index
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
    );

    const indices = new Uint16Array(numVisible);
    const offsets = new Float32Array(numVisible * 3);
    const angles = new Float32Array(numVisible);

    for (let i = 0, j = 0; i < this.numPoints; i++) {
      if (discard && originalColors[i * 4 + 0] <= threshold) continue;

      offsets[j * 3 + 0] = i % this.width;
      offsets[j * 3 + 1] = Math.floor(i / this.width);

      indices[j] = i;

      angles[j] = Math.random() * Math.PI;

      j++;
    }

    geometry.addAttribute(
      "pindex",
      new THREE.InstancedBufferAttribute(indices, 1, false)
    );
    geometry.addAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(offsets, 3, false)
    );
    geometry.addAttribute(
      "angle",
      new THREE.InstancedBufferAttribute(angles, 1, false)
    );

    this.object3D = new THREE.Mesh(geometry, material);
    this.container.add(this.object3D);
  }

  initTouch() {
    // create only once
    if (!this.touch) this.touch = new TouchTexture(this);
    this.object3D.material.uniforms.uTouch.value = this.touch.texture;
  }

  initHitArea() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      depthTest: false,
    });
    material.visible = false;
    this.hitArea = new THREE.Mesh(geometry, material);
    this.container.add(this.hitArea);
  }

  addListeners() {
    this.handlerInteractiveMove = this.onInteractiveMove.bind(this);

    this.webgl.interactive.addListener(
      "interactive-move",
      this.handlerInteractiveMove
    );
    this.webgl.interactive.objects.push(this.hitArea);
    this.webgl.interactive.enable();
  }

  removeListeners() {
    this.webgl.interactive.removeListener(
      "interactive-move",
      this.handlerInteractiveMove
    );

    const index = this.webgl.interactive.objects.findIndex(
      (obj) => obj === this.hitArea
    );
    this.webgl.interactive.objects.splice(index, 1);
    this.webgl.interactive.disable();
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  update(delta) {
    if (!this.object3D) return;
    if (this.touch) this.touch.update();

    this.object3D.material.uniforms.uTime.value += delta;
  }

  show(time = 1.0) {
    // reset
    TweenLite.fromTo(
      this.object3D.material.uniforms.uSize,
      time,
      { value: 0.5 },
      { value: 1.5 }
    );
    TweenLite.to(this.object3D.material.uniforms.uRandom, time, { value: 2.0 });
    TweenLite.fromTo(
      this.object3D.material.uniforms.uDepth,
      time * 1.5,
      { value: 40.0 },
      { value: 4.0 }
    );

    this.addListeners();
  }

  hide(_destroy, time = 0.8) {
    return new Promise((resolve, reject) => {
      TweenLite.to(this.object3D.material.uniforms.uRandom, time, {
        value: 5.0,
        onComplete: () => {
          if (_destroy) this.destroy();
          resolve();
        },
      });
      TweenLite.to(this.object3D.material.uniforms.uDepth, time, {
        value: -20.0,
        ease: Quad.easeIn,
      });
      TweenLite.to(this.object3D.material.uniforms.uSize, time * 0.8, {
        value: 0.0,
      });

      this.removeListeners();
    });
  }

  destroy() {
    if (!this.object3D) return;

    this.object3D.parent.remove(this.object3D);
    this.object3D.geometry.dispose();
    this.object3D.material.dispose();
    this.object3D = null;

    if (!this.hitArea) return;

    this.hitArea.parent.remove(this.hitArea);
    this.hitArea.geometry.dispose();
    this.hitArea.material.dispose();
    this.hitArea = null;
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  resize() {
    if (!this.object3D) return;

    const scale = this.webgl.fovHeight / this.height;
    this.object3D.scale.set(scale, scale, 1);
    this.hitArea.scale.set(scale, scale, 1);
  }

  onInteractiveMove(e) {
    const uv = e.intersectionData.uv;
    if (this.touch) this.touch.addTouch(uv);
  }
}
