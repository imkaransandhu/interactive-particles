import EventEmitter from "events";
import * as THREE from "three";
import * as poseDetection from "@tensorflow-models/pose-detection";
import browser from "browser-detect";
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
  
    this.detector = null;
    this.interval = null;
    this.video = null;
    this.poses = null;
    this.stream = null;
    this.videoConfig = null;
  
    this.createModal(); 

    /////////////////////////////////////////////////////////////////////////
  }

  ///////////////////////////////////////////////////////////////////
  async createModal() {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox
    };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    this.video = document.getElementById("webcam"); // accesing the webcam element
    if (navigator.mediaDevices || navigator.mediaDevices.getUserMedia) { // Checking if the webcam is active 


      // function detectPoses() {
      //   this.detector.estimatePoses(this.video).then((poses) => {
      //     if (poses && poses.length > 0) {
      //       poses[0].keypoints.forEach((keypoint) => {
      //         console.log(keypoint.name)
      //         this.onPose(keypoint);
      //       });
      //     }
      //     requestAnimationFrame(detectPoses.bind(this));
      //   });
      // }


      setInterval(async () => {
        const poses = await detector.estimatePoses(this.video);
        if (poses && poses.length > 0) {

          poses.forEach((personPose) => {
            personPose.keypoints.forEach((keypoint) => {
              console.log(personPose)
              this.onPose(keypoint);  
            });
          })
              }
      },100)

      
    } else {
      console.log("wait for camera to load");
    }
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
    console.log(touch)
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

    
    // Normalize the keyPoints from webcam height and  width to screen width and height
    keyPoints.x = screen.width - ((keyPoints.x/640) * screen.width); // Flippinig the x-cordinates, to create the animation in same direction. 
    const touch = { x: keyPoints.x, y: (keyPoints.y/480) * screen.height };


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
