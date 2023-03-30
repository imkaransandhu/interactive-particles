import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import NavWallMenu from "./NavWallMenu/NavWallMenu";
import styles from "./WallHeader.module.css";

const WallHeader = () => {
  const [menuState, setMenuState] = useState(true);

  const handleMenuState = () => {
    setMenuState(!menuState);
  };

  return (
    <div className={styles["wall-menu"]}>
      <Link href={"/"} className={styles["wall-menu-logo"]}>
        LOREMIPSUM
      </Link>

      <button
        onClick={handleMenuState}
        className={`${styles.hamburger} ${!menuState ? styles.active : ""}`}
      >
        <span></span>
        {menuState && <span></span>}
        <span></span>
      </button>

      {!menuState && <NavWallMenu handleMenuState={handleMenuState} />}
    </div>
  );
};

export default WallHeader;
