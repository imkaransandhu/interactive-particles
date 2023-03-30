import Image from "next/image";
import styles from "./../ImageView.module.css";

const ImageViewCrossButton = ({ handleImageViewCrossBtn }) => {
  return (
    <button
      onClick={handleImageViewCrossBtn}
      className={styles["image-view-cross-button"]}
    >
      <Image
        src={"/images/crossMenu.png"}
        alt="cross or X"
        height={20}
        width={20}
      />
    </button>
  );
};

export default ImageViewCrossButton;
