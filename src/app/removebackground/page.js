/* eslint-disable @next/next/no-img-element */
"use client";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import Webcam from "react-webcam";


export default function Home() {
  const videoCam = useRef(null); 
  const canvasToLoad = useRef(null);
 

  //const [imageUrl, setImageUrl] = useState("/images/sample-10.avif");
  const [loading, setLoading] = useState(true);

 

  useEffect(() => {
    const image = videoCam.current;
    const canvas = canvasToLoad.current;
    removeBackground(image, canvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function removeBackground(img, canvas) {
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
      runtime: "tfjs",
    };
    const segmenter = await bodySegmentation.createSegmenter(
      model,
      segmenterConfig
    );
  
      setInterval( async () => {
        const segmentation = await segmenter.segmentPeople(img.video, {
          multiSegmentation: false,
          segmentBodyParts: true,
        });
        
        // Convert the segmentation into a mask to darken the background.
        const foregroundColor = {r: 255, g: 200, b:100, a: 255}; //  color for where the person or body part is detected 
        const backgroundColor = {r: 0, g: 0, b: 0, a: 255}; // color or mask where the perosn or body part not detected 
        const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
          segmentation,
          foregroundColor,
          backgroundColor
          );
          
          const opacity = 1;
          const maskBlurAmount = 3;
          const flipHorizontal = true;
          
          // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
          // maskBlurAmount set to 3, this will darken the background and blur the
          // darkened background's edge.
          await bodySegmentation.drawMask(
            canvas,
            img.video,
            backgroundDarkeningMask,
            opacity,  
            maskBlurAmount,
            flipHorizontal
            );
            //setImageUrl(canvas.toDataURL());
            setLoading(false);
          },100)
      }
          

  return (
    <Fragment>
       {loading && (
        <h1>Removing Background, please wait ...</h1>
      )}
      
      <canvas 
        width={640}
        height={480} 
       
        ref={canvasToLoad}>

        </canvas>
        
      <Webcam
        id="webcam-rm"
        ref={videoCam}
        width={640}
        height={480} 
        style={{ position : "absolute"}} 
      /> 

    </Fragment>
  );
}


{/* <img
        ref={videoCam}
        src={imageUrl}
        alt="lady"
        height={"auto"}
        width={"auto"}
      /> */}