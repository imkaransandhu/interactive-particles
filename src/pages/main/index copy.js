/* eslint-disable @next/next/no-img-element */
"use client";
import App from "./../../scripts/App";
import { Fragment, useEffect, useState } from "react";
import Webcam from "react-webcam";
import ScreenshotButton from "@/components/ScreenshotButton/ScreenshotButton";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

export default function Home() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const router = useRouter();
  useEffect(() => {
    // Initilizing the interactive particle library
    window.app = new App();
    window.app.init();

    // Generate a new GUID for the session
    const sessionGuid = uuidv4();

    // Construct the session URL with the GUID parameter
    const sessionUrl = `http://localhost:3000/session?sessionGuid=${sessionGuid}`;
    console.log(sessionUrl);

    // Generate the QR code for the session URL
    QRCode.toDataURL(sessionUrl, function (err, url) {
      if (err) {
        console.error(err);
        return;
      }
      // Set the QR code URL in the state
      setQrCodeUrl(url);
    });

    // Set the session GUID as a query parameter on the route
    router.replace({
      pathname: "/main",
      query: { sessionGuid },
    });
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

      <h1>Scan this QR code to start your session:</h1>
      {qrCodeUrl && <img src={qrCodeUrl} alt="QR code" />}

      <ScreenshotButton />
    </Fragment>
  );
}
