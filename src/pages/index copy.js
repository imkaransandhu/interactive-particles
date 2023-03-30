"use client";
import styles from "./page.module.css";
import Link from "next/link";
import X2JS from "x2js";
import useSWR from "swr";
const x2js = new X2JS();
export default function Home() {
  const fetcher = async function fetchData() {
    const response = await fetch("/api/gallery/route");
    const dataReturned = await response.text();
    const json = await x2js.xml2js(dataReturned);
    console.log(json.EnumerationResults.Blobs.Blob);
    return json.EnumerationResults.Blobs.Blob;
  };
  const { data, error, isLoading } = useSWR("/api/gallery/route", fetcher);
  if (error)
    return (
      <div
        style={{
          backgroundColor: "black",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {" "}
        <h1>Failed to load</h1>{" "}
      </div>
    );
  if (isLoading)
    return (
      <div
        style={{
          backgroundColor: "black",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {" "}
        <h1>Loading...</h1>{" "}
      </div>
    );
  return (
    <main className={styles.main}>
      {" "}
      <h1>Gallery Page</h1>{" "}
      {/* <Link href="/dsioiosdihfhbwbhshvyqgaiusgdjjjsd">
        {" "}
        Interactive Feature Page{" "}
      </Link>{" "} */}
      {data.map((item, index) => {
        return (
          <img
            src={item.Url}
            key={item.Etag}
            alt="Captured interactive image"
          ></img>
        );
      })}
    </main>
  );
}
