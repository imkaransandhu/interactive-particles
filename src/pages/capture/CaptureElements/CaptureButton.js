import styles from "./CaptureElements.module.css";

const CaptureButton = ({ handlecapture }) => {
  return (
    <button
      onClick={handlecapture}
      className={styles["capture-button"]}
    ></button>
  );
};

export default CaptureButton;
