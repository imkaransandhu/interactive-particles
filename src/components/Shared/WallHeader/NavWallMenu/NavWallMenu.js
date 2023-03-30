import styles from "./NavWallMenu.module.css";

import Link from "next/link";

const NavWallMenu = ({ handleMenuState }) => {
  return (
    <ul className={styles["nav-wall-menu"]}>
      <li>
        <Link onClick={handleMenuState} href={"/capture"}>
          Capture
        </Link>
      </li>
      <li>
        <Link onClick={handleMenuState} href={"/"}>
          Gallery
        </Link>
      </li>
    </ul>
  );
};

export default NavWallMenu;
