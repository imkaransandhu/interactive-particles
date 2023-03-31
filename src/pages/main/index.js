/* eslint-disable @next/next/no-img-element */
"use client";
import App from "./../../scripts/App";
import { Fragment, useEffect } from "react";
import Webcam from "react-webcam";

export default function Home() {
  useEffect(() => {
    // Initilizing the interactive particle library
    window.app = new App();
    window.app.init();
  }, []);

  return (
    <Fragment>
      {/* Container containing the particles created image */}
      <div className="container"></div>

      <Webcam
        id="webcam"
        width={640}
        height={480}
        style={{
          visibility: "hidden",
          zIndex: "-12",
          position: "absolute",
          top: 0,
        }}
      />
    </Fragment>
  );
}
