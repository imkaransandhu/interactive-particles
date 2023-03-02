import React, { Component } from "react";
import WebGLView from "./webgl/WebGLView";
import GUIView from "./gui/GUIView";

class App extends Component {
  constructor(props) {
    super(props);
    this.handlerAnimate = this.animate.bind(this);
  }

  componentDidMount() {
    this.initWebGL();
    this.initGUI();
    this.addListeners();
    this.animate();
    this.resize();
  }

  initWebGL() {
    this.webgl = new WebGLView(this);
    document
      .querySelector(".container")
      .appendChild(this.webgl.renderer.domElement);
  }

  initGUI() {
    this.gui = new GUIView(this);
  }

  addListeners() {
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("keyup", this.keyup.bind(this));

    const el = this.webgl.renderer.domElement;
    el.addEventListener("click", this.click.bind(this));
  }

  animate() {
    this.update();
    this.draw();

    this.raf = requestAnimationFrame(this.handlerAnimate);
  }

  update() {
    if (this.gui.stats) this.gui.stats.begin();
    if (this.webgl) this.webgl.update();
    if (this.gui) this.gui.update();
  }

  draw() {
    if (this.webgl) this.webgl.draw();
    if (this.gui.stats) this.gui.stats.end();
  }

  resize() {
    if (this.webgl) this.webgl.resize();
  }

  keyup(e) {
    // g
    if (e.keyCode === 71) {
      if (this.gui) this.gui.toggle();
    }
  }

  click(e) {
    this.webgl.next();
  }

  render() {
    return (
      <div className="container">
        {/* WebGLView and GUIView components will be inserted here */}
      </div>
    );
  }
}

export default App;
