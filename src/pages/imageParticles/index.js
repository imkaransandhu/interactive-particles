"use client";
import App from "../../scriptsImageParticles/App";
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

      <canvas
        style={{
          width: 320,
          height: 180,
          position: "absolute",
          top: "50%",
          right: 0,
        }}
        id={"canvasToLoad"}
      ></canvas>

      <button
        style={{
          position: "fixed",
          bottom: "5rem",
          right: "5rem",
          backgroundColor: "Red",
          borderColor: "white",
          padding: "0.5rem 2rem",
          borderRadius: "2rem",
          cursor: "pointer",
          color: "white",
        }}
        id="click-photo"
      >
        Click your photo
      </button>

      <Webcam
        id="webcam"
        width={360}
        height={180}
        style={{ position: "absolute", left: 0, top: 0 }}
      />
    </Fragment>
  );
}
