"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./ScreenshotButton.module.css";
import html2canvas from "html2canvas";
import axios from "axios";
import io from "socket.io-client";
import { dataURLToBlob } from "blob-util";

const ScreenshotButton = () => {
  const [imgSrc, setImgSrc] = useState();
  const [socket, setSocket] = useState(null);

  // Function to take the screenshot and then call the endpoint to send it to te server
  function takeScreenshot() {
    let dataUrl;
    const canvasElement = document.querySelector(".container"); //getting the container in which the canvas element is
    const allElArray = Array.from(canvasElement.children); // grabbing all elments in the container and convering it to an array
    const canvas = "CANVAS";
    // checking if the canvas element is present in the container
    allElArray.forEach((child) => {
      if (child.nodeName === canvas) {
        canvasElement.children[0].style.backgroundColor = "black"; // adding a black bacakground to the canvas

        // grabbing the screenshot as Data URI
        html2canvas(canvasElement.children[0]).then((canvas) => {
          dataUrl = canvas.toDataURL("image/png");
          setImgSrc(dataUrl);
        });
      }
    });
  }

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch("/api/screenshot");
      const newSocket = io();

      newSocket.on("connect", () => {
        console.log("connected");
      });

      newSocket.on("screen1-click", () => {
        takeScreenshot();
      });

      setSocket(newSocket);
    };

    socketInitializer();
  }, []);

  useEffect(() => {
    // function to check the if the string is a valid uri
    function isDataURI(str) {
      return /^data:[^;]+(;[^,]+)*(,.*|$)/.test(str);
    }

    // Validating if the imgSrc is a valid DataURI
    if (isDataURI(imgSrc)) {
      //  Creating the name of file with a time and date stamp

      const blob = dataURLToBlob(imgSrc);
      console.log(blob);
      let config = {
        method: "put",
        maxContentLength: 100 * 1024 * 1024, // 100MB
        maxBodyLength: 100 * 1024 * 1024, // 100MB
        url: "/api/PutBlob",
        data: blob,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      };

      axios
        .request(config)
        .then((response) => {
          console.log(response.data);
          socket.emit("screen1-click");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [imgSrc]);

  return (
    <div className={styles.buttonComponent}>
      <button
        onClick={() => takeScreenshot()}
        className={styles.button}
        style={{ cursor: "pointer" }}
      >
        {" "}
        Grab{" "}
      </button>

      <Image
        id="blobImage"
        src={imgSrc ? imgSrc : "/images/sample-01.jpg"}
        alt={"screnshot"}
        height={100}
        width={100}
      />
    </div>
  );
};

export default ScreenshotButton;
