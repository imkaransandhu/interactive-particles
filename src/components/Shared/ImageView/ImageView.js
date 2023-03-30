import styles from "./ImageView.module.css";
import ImageViewCopyButton from "./ImageViewElements/ImageViewCopyButton";
import ImageViewCrossButton from "./ImageViewElements/ImageViewCrossButton";
import ImageViewPhoto from "./ImageViewElements/ImageViewPhoto";
import ImageViewText from "./ImageViewElements/ImageViewText";

const ImageView = ({ imgSrc, handleImageViewCrossBtn }) => {
  return (
    <div className={styles["image-view"]}>
      <ImageViewText imgSrc={imgSrc} />
      <ImageViewCrossButton handleImageViewCrossBtn={handleImageViewCrossBtn} />
      <ImageViewPhoto imgSrc={imgSrc} />
      <ImageViewCopyButton imgSrc={imgSrc} />
    </div>
  );
};

export default ImageView;
