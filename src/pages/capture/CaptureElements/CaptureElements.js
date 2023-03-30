import CaptureButton from "./CaptureButton";
import styles from "./CaptureElements.module.css";
import CaptureText from "./CaptureText";

const CaptureElements = ({ handlecapture }) => {
  return (
    <div className={styles["capture-elements"]}>
      <CaptureText />
      <CaptureButton handlecapture={handlecapture} />
    </div>
  );
};

export default CaptureElements;
