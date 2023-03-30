"use client";
import { useEffect, useState } from "react";
import styles from "./ScreenshotButton.module.css";
import io from "socket.io-client";

const ScreenshotButtonSend = () => {
  const [socket, setSocket] = useState(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch("/api/screenshot");
      const newSocket = io();

      newSocket.on("connect", () => {
        console.log("connected");
      });

      newSocket.on("screen2-click", () => {
        console.log("send");
      });
      setSocket(newSocket);
    };

    socketInitializer();
  }, []);

  const takeScreenshot = () => {
    socket.emit("screen2-click");
  };

  return (
    <div className={styles.buttonComponent}>
      <button
        onClick={takeScreenshot}
        disabled={clicked}
        className={styles.button}
      >
        Grab
      </button>
    </div>
  );
};

export default ScreenshotButtonSend;
