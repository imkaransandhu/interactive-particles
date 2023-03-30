"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./ScreenshotButton.module.css";
import html2canvas from "html2canvas";
import axios from "axios";
import io from "socket.io-client";

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

      newSocket.on("receive-blob", () => {
        console.log("Received");
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
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = (currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0"); // getMonth() returns 0-indexed month, so add 1
      const currentDay = currentDate.getDate().toString().padStart(2, "0");
      const currentHour = currentDate.getHours().toString().padStart(2, "0");
      const currentMinute = currentDate
        .getMinutes()
        .toString()
        .padStart(2, "0");
      const currentSecond = currentDate
        .getSeconds()
        .toString()
        .padStart(2, "0");
      const fileName = `image_${currentMonth}.${currentDay}.${currentYear}_${currentHour}:${currentMinute}:${currentSecond}.png`;

      // Data Object sent to the backend
      let data = {
        imgData: imgSrc,
        name: fileName,
      };

      let config = {
        method: "put",
        maxBodyLength: Infinity,
        url: "/api/PutBlob",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(response.data);
          //socket.emit("screen1-click");

          console.log("Emit a new image");
          socket.emit("uploaded-blob", fileName);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
