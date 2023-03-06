import EventEmitter from "events";
import * as THREE from "three";
import browser from "browser-detect";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import { passiveEvent } from "../../utils/event.utils.js";

export default class InteractiveControls extends EventEmitter {
  get enabled() {
    return this._enabled;
  }

  constructor(camera, el) {
    super();

    this.camera = camera;
    this.el = el || window;

    this.plane = new THREE.Plane();
    this.raycaster = new THREE.Raycaster();

    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
    this.intersection = new THREE.Vector3();

    this.objects = [];
    this.hovered = null;
    this.selected = null;

    this.isDown = false;

    this.browser = browser();

    this.enable();

    /////////////////////////////////////////////////////////////////////
    this.detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox,
    };
    this.detector = null;
    this.interval = null;
    this.video = null;
    this.poses = null;
    this.stream = null;
    this.videoConfig = null;
    // this.poseArray = [];
    this.initialize(); // Call the initialize method in the constructor to start the interval
    // this.runDetector();
    /////////////////////////////////////////////////////////////////////////
  }

  ///////////////////////////////////////////////////////////////////
  async initialize() {
    this.detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      this.detectorConfig
    );

    this.video = document.createElement("video");
    this.video.autoplay = true;
    this.videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: screen.width,
        height: screen.height,
        frameRate: {
          ideal: 60,
        },
      },
    };

    // if (navigator.mediaDevices || navigator.mediaDevices.getUserMedia) {
    //   this.stream = await navigator.mediaDevices.getUserMedia(this.videoConfig);
    //   this.video.srcObject = this.stream;
    //   this.interval = setInterval(async () => {
    //     this.poses = await this.detector.estimatePoses(this.video);
    //     if (this.poses.length > 0 && this.poses) {
    //       this.poses[0].keypoints.forEach((keypoint) => {
    //         this.onPose(keypoint);
    //         console.log(keypoint);
    //       });
    //     }
    //     // if (
    //     //   this.poses &&
    //     //   this.poses.length > 0 &&
    //     //   this.poses[0].keypoints &&
    //     //   this.poses[0].keypoints.length > 0
    //     // ) {
    //     //   console.log(this.poses[0].keypoints[10]);
    //     //   this.onPose(this.poses[0].keypoints[10]);
    //     // }
    // }, 100);
    const animate = async () => {
      this.raf = requestAnimationFrame(animate);
      this.poses = await this.detector.estimatePoses(this.video);
      console.log("kkk");
      if (this.poses.length > 0 && this.poses) {
        this.poses[0].keypoints.forEach((keypoint) => {
          this.onPose(keypoint);
          console.log(keypoint);
        });
      }
    };
    this.raf = requestAnimationFrame(animate);
  }

  /////////////////////////////////////////////////////////////

  enable() {
    if (this.enabled) return;
    this.addListeners();
    this._enabled = true;
  }

  disable() {
    if (!this.enabled) return;
    this.removeListeners();
    this._enabled = false;
  }

  addListeners() {
    this.handlerDown = this.onDown.bind(this);
    this.handlerMove = this.onMove.bind(this);
    this.handlerUp = this.onUp.bind(this);
    this.handlerLeave = this.onLeave.bind(this);

    if (this.browser.mobile) {
      this.el.addEventListener("touchstart", this.handlerDown, passiveEvent);
      this.el.addEventListener("touchmove", this.handlerMove, passiveEvent);
      this.el.addEventListener("touchend", this.handlerUp, passiveEvent);
    } else {
      this.el.addEventListener("mousedown", this.handlerDown);
      this.el.addEventListener("mousemove", this.handlerMove);
      this.el.addEventListener("mouseup", this.handlerUp);
      this.el.addEventListener("mouseleave", this.handlerLeave);
    }
  }

  removeListeners() {
    if (this.browser.mobile) {
      this.el.removeEventListener("touchstart", this.handlerDown);
      this.el.removeEventListener("touchmove", this.handlerMove);
      this.el.removeEventListener("touchend", this.handlerUp);
    } else {
      this.el.removeEventListener("mousedown", this.handlerDown);
      this.el.removeEventListener("mousemove", this.handlerMove);
      this.el.removeEventListener("mouseup", this.handlerUp);
      this.el.removeEventListener("mouseleave", this.handlerLeave);
    }
  }

  resize(x, y, width, height) {
    if (x || y || width || height) {
      this.rect = { x, y, width, height };
    } else if (this.el === window) {
      this.rect = {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    } else {
      this.rect = this.el.getBoundingClientRect();
    }
  }

  onMove(e) {
    const t = e.touches ? e.touches[0] : e;
    const touch = { x: t.clientX, y: t.clientY };

    this.mouse.x = ((touch.x + this.rect.x) / this.rect.width) * 2 - 1;
    this.mouse.y = -((touch.y + this.rect.y) / this.rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    /*
      // is dragging
      if (this.selected && this.isDown) {
        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
          this.emit('interactive-drag', { object: this.selected, position: this.intersection.sub(this.offset) });
        }
        return;
      }
      */

    const intersects = this.raycaster.intersectObjects(this.objects);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.intersectionData = intersects[0];

      this.plane.setFromNormalAndCoplanarPoint(
        this.camera.getWorldDirection(this.plane.normal),
        object.position
      );

      if (this.hovered !== object) {
        this.emit("interactive-out", { object: this.hovered });
        this.emit("interactive-over", { object });
        this.hovered = object;
      } else {
        this.emit("interactive-move", {
          object,
          intersectionData: this.intersectionData,
        });
      }
    } else {
      this.intersectionData = null;

      if (this.hovered !== null) {
        this.emit("interactive-out", { object: this.hovered });
        this.hovered = null;
      }
    }
  }

  onDown(e) {
    this.isDown = true;
    this.onMove(e);

    this.emit("interactive-down", {
      object: this.hovered,
      previous: this.selected,
      intersectionData: this.intersectionData,
    });
    this.selected = this.hovered;

    if (this.selected) {
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.offset.copy(this.intersection).sub(this.selected.position);
      }
    }
  }

  onUp(e) {
    this.isDown = false;

    this.emit("interactive-up", { object: this.hovered });
  }

  onLeave(e) {
    this.onUp(e);

    this.emit("interactive-out", { object: this.hovered });
    this.hovered = null;
  }

  onPose(keyPoints) {
    //const t = this.poses[0].keypoints[0];
    const touch = { x: keyPoints.x, y: keyPoints.y };

    this.mouse.x = ((touch.x + this.rect.x) / this.rect.width) * 2 - 1;
    this.mouse.y = -((touch.y + this.rect.y) / this.rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    /*
      // is dragging
      if (this.selected && this.isDown) {
        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
          this.emit('interactive-drag', { object: this.selected, position: this.intersection.sub(this.offset) });
        }
        return;
      }
      */

    const intersects = this.raycaster.intersectObjects(this.objects);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.intersectionData = intersects[0];

      this.plane.setFromNormalAndCoplanarPoint(
        this.camera.getWorldDirection(this.plane.normal),
        object.position
      );

      if (this.hovered !== object) {
        this.emit("interactive-out", { object: this.hovered });
        this.emit("interactive-over", { object });
        this.hovered = object;
      } else {
        this.emit("interactive-move", {
          object,
          intersectionData: this.intersectionData,
        });
      }
    } else {
      this.intersectionData = null;

      if (this.hovered !== null) {
        this.emit("interactive-out", { object: this.hovered });
        this.hovered = null;
      }
    }
  }
}
