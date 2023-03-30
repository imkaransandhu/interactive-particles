import React, { Component } from "react";
import ControlKit from "@brunoimbrizi/controlkit";
import Stats from "stats.js";

class GUIView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      particlesHitArea: false,
      particlesRandom: 2,
      particlesDepth: 4,
      particlesSize: 1.5,
      touchRadius: 0.15,
      range: [0, 1],
      rangeRandom: [1, 10],
      rangeSize: [0, 3],
      rangeDepth: [1, 10],
      rangeRadius: [0, 0.5],
    };

    this.touchCanvas = null;
    this.touchCtx = null;
    this.controlKit = null;
    this.stats = null;

    this.onTouchChange = this.onTouchChange.bind(this);
    this.onParticlesChange = this.onParticlesChange.bind(this);
    this.onPostProcessingChange = this.onPostProcessingChange.bind(this);
  }

  initControlKit() {
    this.controlKit = new ControlKit();

    this.controlKit
      .addPanel({ width: 300, enable: false })

      .addGroup({ label: "Touch", enable: true })
      .addCanvas({ label: "trail", height: 64 })
      .addSlider(this.state, "touchRadius", "rangeRadius", {
        label: "radius",
        onChange: this.onTouchChange,
      })

      .addGroup({ label: "Particles", enable: true })
      // .addCheckbox(this.state, 'particlesHitArea', { label: 'hit area', onChange: this.onParticlesChange })
      .addSlider(this.state, "particlesRandom", "rangeRandom", {
        label: "random",
        onChange: this.onParticlesChange,
      })
      .addSlider(this.state, "particlesDepth", "rangeDepth", {
        label: "depth",
        onChange: this.onParticlesChange,
      })
      .addSlider(this.state, "particlesSize", "rangeSize", {
        label: "size",
        onChange: this.onParticlesChange,
      });

    // store reference to canvas
    const component = this.controlKit.getComponentBy({ label: "trail" });
    if (!component) return;

    this.touchCanvas = component._canvas;
    this.touchCtx = this.touchCanvas.getContext("2d");
  }

  initStats() {
    this.stats = new Stats();

    document.body.appendChild(this.stats.dom);
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  update() {
    // draw touch texture
    if (this.touchCanvas) {
      if (!this.props.app.webgl) return;
      if (!this.props.app.webgl.particles) return;
      if (!this.props.app.webgl.particles.touch) return;
      const source = this.props.app.webgl.particles.touch.canvas;
      const x = Math.floor((this.touchCanvas.width - source.width) * 0.5);
      this.touchCtx.fillRect(
        0,
        0,
        this.touchCanvas.width,
        this.touchCanvas.height
      );
      this.touchCtx.drawImage(source, x, 0);
    }
  }

  enable() {
    this.initControlKit();
    this.initStats();

    this.controlKit.enable();
    if (this.stats) this.stats.dom.style.display = "";
  }

  disable() {
    this.controlKit.disable();
    if (this.stats) this.stats.dom.style.display = "none";
  }

  toggle() {
    if (this.controlKit._enabled) this.disable();
    else this.enable();
  }

  onTouchChange() {
    if (!this.props.app.webgl) return;
    if (!this.props.app.webgl.particles) return;

    this.app.props.webgl.particles.touch.radius = this.touchRadius;
  }

  onParticlesChange() {
    if (!this.props.app.webgl) return;
    if (!this.props.app.webgl.particles) return;

    this.props.app.webgl.particles.object3D.material.uniforms.uRandom.value =
      this.particlesRandom;
    this.props.app.webgl.particles.object3D.material.uniforms.uDepth.value =
      this.particlesDepth;
    this.props.app.webgl.particles.object3D.material.uniforms.uSize.value =
      this.particlesSize;

    this.props.app.webgl.particles.hitArea.material.visible =
      this.particlesHitArea;
  }

  onPostProcessingChange() {
    if (!this.props.app.webgl.composer) return;
    this.props.app.webgl.composer.enabled = this.postProcessing;
  }
}

export default GUIView;
