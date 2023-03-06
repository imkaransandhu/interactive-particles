"use client";

import App from "./scripts/App";
import { Fragment, useEffect } from "react";
import Webcam from "react-webcam";

export default function Home() {
  useEffect(() => {
    window.app = new App();
    window.app.init();
  }, []);

  return (
    <Fragment>
      <div className="container"></div>
      <h1 className="interactive-wall">Interactive Wall</h1>
      <Webcam style={{ height: "100%", width: "100%" }} id={"webcam"} />
    </Fragment>
  );
}
