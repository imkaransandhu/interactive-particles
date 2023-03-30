import { cos } from "@tensorflow/tfjs-core";
import { useState } from "react";
import styles from "./../ImageView.module.css";

const ImageViewCopyButton = ({ imgSrc }) => {
  const [copyBtnText, setCopyBtnText] = useState("Copy Text");

  const handleCopyBtn = () => {
    console.log(imgSrc);
    navigator.clipboard.writeText(imgSrc);
    setCopyBtnText("Copied!");
  };

  return (
    <div className={styles["image-view-copy-button"]}>
      <button
        className={copyBtnText === "Copied!" && styles["copied"]}
        onClick={handleCopyBtn}
      >
        {copyBtnText}
      </button>
    </div>
  );
};

export default ImageViewCopyButton;
