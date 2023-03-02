"use client";

import App from "./scripts/App";
import { Fragment, useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.app = new App();
    window.app.init();
  }, []);

  return (
    <Fragment>
      <div className="container"></div>
      <h1 className="interactive-wall">Interactive Wall</h1>
    </Fragment>
  );
}
