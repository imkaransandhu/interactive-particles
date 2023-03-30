/* eslint-disable @next/next/no-img-element */
"use client";
import styles from "./page.module.css";
import Link from "next/link";
import X2JS from "x2js";
import useSWR from "swr";
import NavWallMenu from "@/components/Shared/WallHeader/NavWallMenu/NavWallMenu";
import WallMenu from "@/components/Shared/WallHeader/WallHeader";
import CaptureSession from "@/components/Shared/CaptureSession/CaptureSession";
import { Fragment, use, useEffect, useState } from "react";
import ImageView from "@/components/Shared/ImageView/ImageView";
import axios from "axios";
import io from "socket.io-client";

const x2js = new X2JS();
export default function Home() {
  async function fetchData() {
    const response = await fetch("/api/gallery/route");
    const dataReturned = await response.text();
    const json = await x2js.xml2js(dataReturned);
    const newData = json.EnumerationResults.Blobs.Blob;
    function sortByLastModified(arr) {
      arr.sort(function (a, b) {
        return (
          new Date(b.LastModified).getTime() -
          new Date(a.LastModified).getTime()
        );
      });
      return arr;
    }
    const sortedData = sortByLastModified(newData);
    // console.log(newData, sortedData);
    setData(sortedData);
  }

  const [imgSrc, setImgSrc] = useState(null);
  const [data, setData] = useState([]);
  const [newImage, setNewImage] = useState(false);
  const [socket, setSocket] = useState();

  const loadImageView = (e) => {
    const imageEtag = e.target.getAttribute("etag");
    const imageSource = e.target.getAttribute("src");
    setImgSrc(imageSource);
  };

  const handleImageViewCrossBtn = () => {
    setImgSrc(null);
  };

  useEffect(() => {
    console.log(newImage);
    if (newImage) {
      console.log("i am there");
      // setImgSrc(data[0].Url);
    }
  }, [data, newImage]);

  function handleNewImage() {
    console.log("ChangeImage");
    setNewImage(true);
  }

  useEffect(() => {
    fetchData();

    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    await fetch("/api/screenshot");
    const newSocket = io();

    newSocket.on("connect", () => {
      console.log("connected");
    });

    newSocket.on("loadLastImage", (blobName) => {
      console.log("Last Image Call Recceived");
      // handleNewImage();
      //console.log(data[0].Url);
      console.log(blobName);

      setImgSrc(
        `https://interactivewallgallery.blob.core.windows.net/gallery/${blobName}`
      );

      // setTimeout(() => {
      //   handleNewImage();
      // }, 2000);
      //setImgSrc(data[0].url);
    });

    setSocket(newSocket);
  };

  return (
    <main className={styles.main}>
      {" "}
      <CaptureSession />
      <WallMenu />
      {data.length !== 0 ? (
        <div style={{ marginTop: "5rem" }}>
          {data.map((item, index) => {
            return (
              <button
                style={{
                  border: "0",
                  background: "#000",
                  height: "15rem",
                  width: "100%",
                }}
                onClick={loadImageView}
                key={index}
              >
                <img
                  height={"100%"}
                  width={"100%"}
                  src={item.Url}
                  key={item.Etag}
                  etag={item.Etag}
                  alt="Captured interactive image"
                ></img>
              </button>
            );
          })}
        </div>
      ) : (
        <h1>Loading</h1>
      )}
      {imgSrc && (
        <ImageView
          imgSrc={imgSrc}
          handleImageViewCrossBtn={handleImageViewCrossBtn}
        />
      )}
    </main>
  );
}
