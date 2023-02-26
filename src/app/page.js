"use client";

import App from "./scripts/App";
import { Fragment, useState, useEffect } from "react";

export default function Home() {
  // const [hasRunOnce, setHasRunOnce] = useState(false);

  useEffect(() => {
    // function app() {

    // }
    // if (!hasRunOnce) {
    //   app();
    // }
    // setHasRunOnce(true);

    // console.log("karan");

    window.app = new App();
    //console.log(window.app);
    window.app.init();
  }, []);

  return (
    <Fragment>
      <div className="container"></div>
      <div className="karan">Karan Singh </div>
    </Fragment>
  );
}
