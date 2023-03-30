import Image from "next/image";
import styles from "./LoadingCapture.module.css";

const LoadingCapture = () => {
  return (
    <div className={styles["loading-capture"]}>
      <Image
        src={"/images/ArrowUp.png"}
        alt="Watch the screen"
        height={150}
        width={100}
      />
      <p className={styles["loading-capture-text"]}>
        The capture timer has started - look toward the large display and get
        creative!
      </p>
    </div>
  );
};

export default LoadingCapture;
