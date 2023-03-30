import Image from "next/image";
import Webcam from "react-webcam";

const { Fragment } = require("react");

const WorkingElements = ({
  canvas,
  webcam,
  videoToReveal,
  imgRef,
  backgroundImages,
  videoToRevealSrc,
  currentScreen,
}) => {
  return (
    <Fragment>
      <canvas
        ref={canvas}
        style={{
          visibility: "hidden",
          width: "100%",
          height: "100vh",
          position: "relative",
          zIndex: "-1",
        }}
        id={"canvasToLoad"}
      ></canvas>
      <Image
        ref={imgRef}
        src={backgroundImages[currentScreen]}
        alt="value photo"
        width={640}
        height={480}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: "0.3",
        }}
      />
      <Webcam
        id="webcam"
        ref={webcam}
        width={640}
        height={480}
        style={{
          visibility: "hidden",
          zIndex: "-12",
          position: "absolute",
          left: 0,
          top: 0,
        }}
      />
      <video
        ref={videoToReveal}
        id="myVideo"
        width="640"
        height="480"
        controls
        src={videoToRevealSrc[currentScreen]}
        loop
        style={{
          visibility: "hidden",
          position: "absolute",
          zIndex: "-12",
          top: 0,
          left: 0,
        }}
      ></video>
    </Fragment>
  );
};

export default WorkingElements;
