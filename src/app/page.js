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
      <video className="video"  autoPlay muted loop> 
          <source src="video/your-video.mp4" type="video/mp4"/>
         </video>
      <Webcam
        id="webcam"
        style={{ visibility: "hidden", zIndex : "-1" ,  position: "absolute",  top : "0px" }}
      />
    </Fragment>
  );
}
