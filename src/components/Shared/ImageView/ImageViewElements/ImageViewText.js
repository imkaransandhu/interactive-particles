import { useEffect, useState } from "react";
import styles from "./../ImageView.module.css";

const ImageViewText = ({ imgSrc }) => {
  const [value, setvalue] = useState();
  const [dateTime, setDateTime] = useState();

  useEffect(() => {
    getDetailsFromImdSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getDetailsFromImdSrc() {
    function formatDate(str) {
      const splitOn_ = str.split("_");
      const removeFileExtension = splitOn_[2].split(".");
      return `${splitOn_[1]}_${removeFileExtension[0]}`;
    }

    setDateTime(formatDate(imgSrc));
  }

  return (
    <div className={styles["image-view-text"]}>
      <h2>Look Beyond Today</h2>
      <p>{dateTime ? dateTime : "23.03.23_10:00am"}</p>
    </div>
  );
};

export default ImageViewText;
