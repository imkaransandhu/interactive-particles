"use client";
import App from "./../scripts/App";
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

      {/* Video being played in the background */}
        {/* <video id="canvasVideo" className="video"  autoPlay muted loop> 
            <source src="video/kinect.mp4" type="video/mp4"/>
          </video> */}

          <video id="canvasVideo" className="video"  autoPlay muted loop> 
            <source src="" type="video/mp4"/>
          </video>

      {/* Webcam for getiin the xy-cordinates of 17 key body points */}
      <canvas 
        style={{ visibility: "hidden", width: "100vw" , height : "100vh", position: "absolute", top : 0 , zIndex : "-20"}} 
        id={"canvasToLoad"}>
        </canvas>



      <Webcam
        id="webcam"
        width={640}
        height={480}
        style={{ visibility: "hidden", zIndex : "-12" ,  position: "absolute",  top : 0 }}
      />
    </Fragment>
  );
}
