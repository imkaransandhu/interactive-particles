"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./ScreenshotButton.module.css";
import html2canvas from "html2canvas";
import axios from "axios";
import { dataURLToBlob } from "blob-util";
import io from "socket.io-client";

const ScreenshotButton = () => {
  const [imgSrc, setImgSrc] = useState();
  const [blobHolder, setBlobHolder] = useState();
  const [clicked, setClicked] = useState(false);
  const [socket, setSocket] = useState(null);
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
    // Emit a 'screen1-click' event to the server
    //socket.emit("screen1-click");
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
    console.log(imgSrc);
    //  Creating the name of file with a time and date stamp

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-indexed month, so add 1
    const currentDay = currentDate.getDate();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSecond = currentDate.getSeconds();
    const fileName = `image_${currentMonth}_${currentDay}_${currentYear}_${currentHour}:${currentMinute}:${currentSecond}`;

    // function to check the if the string is a valid uri
    function isDataURI(str) {
      console.log(str);
      return /^data:[^;]+(;[^,]+)*(,.*|$)/.test(str);
    }
    console.log(imgSrc);
    //
    if (isDataURI(imgSrc)) {
      console.log("true");
      const blob = dataURLToBlob(imgSrc);
      console.log(blob);
      setBlobHolder(blob);
      let config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `https://interactivewallgallery.blob.core.windows.net/gallery/${fileName}?sv=2021-12-02&ss=bf&srt=o&sp=rwdlaciytfx&se=2024-04-16T08:00:35Z&st=2023-03-12T23:00:35Z&spr=https&sig=tFEnx2jJW%2FNWhWZW4mHBH5uhIVoAlaPsV5pGSMdWvTk%3D`,
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": "image/png",
        },
        data: blob,
      };

      if (blob) {
        axios(config)
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }
  }, [imgSrc]);

  return (
    <div className={styles.buttonComponent}>
      <button
        onClick={() => takeScreenshot()}
        className={styles.button}
        disabled={clicked}
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
