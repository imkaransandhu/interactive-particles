"use client";
import { useEffect, useState, Fragment } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";

// Components
import CaptureSession from "@/components/Shared/CaptureSession/CaptureSession";
import WallMenu from "@/components/Shared/WallHeader/WallHeader";
import CaptureElements from "./CaptureElements/CaptureElements";
import LoadingCapture from "./LoadingCapture/Loadingcapture";

export default function Home() {
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [socket, setSocket] = useState(null);

  const routeToGalleryImageView = useRouter();

  useEffect(() => {
    socketInitializer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socketInitializer = async () => {
    await fetch("/api/screenshot");
    const newSocket = io();

    newSocket.on("connect", () => {
      console.log("connected");
    });

    newSocket.on("routeToGallery", () => {
      routeToGalleryImageView.push("/");
    });
    setSocket(newSocket);
  };

  const handlecapture = () => {
    setLoadingScreen(!loadingScreen);
    socket.emit("send-blob");
    console.log("Capture button is Clicked");
  };

  return (
    <Fragment>
      <CaptureSession />
      <WallMenu />
      <CaptureElements handlecapture={handlecapture} />
      {loadingScreen && <LoadingCapture />}
    </Fragment>
  );
}
