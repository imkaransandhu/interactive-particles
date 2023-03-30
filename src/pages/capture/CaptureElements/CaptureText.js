import Image from "next/image";
import styles from "./CaptureElements.module.css";

const CaptureText = () => {
  return (
    <div className={styles["capture-text"]}>
      <div className={styles["capture-text-heading"]}>
        <h2>Capture </h2>
        <Image
          src="/images/CaptureIcon.png"
          height={25}
          width="30"
          alt="capture icon"
        />
      </div>
      <p>Dorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  );
};

export default CaptureText;
