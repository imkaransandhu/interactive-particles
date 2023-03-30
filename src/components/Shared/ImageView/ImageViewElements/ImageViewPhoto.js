/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import styles from "./../ImageView.module.css";

const ImageViewPhoto = ({ imgSrc }) => {
  return (
    <div className={styles["image-view-photo"]}>
      <img src={imgSrc} alt="cross or X" />
    </div>
  );
};

export default ImageViewPhoto;
