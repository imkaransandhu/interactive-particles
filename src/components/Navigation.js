import Link from "next/link";

function Nav() {
  return (
    <nav>
      <ul
        style={{
          display: "flex",
          justifyContent: "space-between",
          listStyle: "none",
          margin: "1rem 5rem",
        }}
      >
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/imageparticles">Image To particles</Link>
        </li>
        <li>
          <Link href="/main">Main</Link>
        </li>
        <li>
          <Link href="/webcamparticles">Webcam</Link>
        </li>
        <li>
          <Link href="/videosrcparticles">Video</Link>
        </li>
        <li>
          <Link href="/removebackground">Remove BG</Link>
        </li>
        <li>
          <Link href="/double">Remove BG + particles</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
