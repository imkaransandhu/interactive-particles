import CryptoJS from "crypto-js";
export default async function get(request, res) {
  const key = process.env.AZURE_BLOB_KEY;
  process.env.dateHeader = new Date().toUTCString();
  // console.log(process.env.dateHeader);
  const strToSign =
    "GET\n\n\n\nx-ms-date:" +
    process.env.dateHeader +
    "\n/interactivewallgallery/gallery?comp=list";
  // console.log(strToSign);
  const secret = CryptoJS.enc.Base64.parse(key);
  const hash = CryptoJS.HmacSHA256(strToSign, secret);
  const base64EncodedHash = CryptoJS.enc.Base64.stringify(hash);
  process.env.authSig = "SharedKey interactivewallgallery:" + base64EncodedHash;
  // ======================V2===========================//
  const myHeaders = new Headers();
  myHeaders.append("x-ms-date", process.env.dateHeader);
  myHeaders.append("Authorization", process.env.authSig);
  let myData;
  const requestOptions = {
    method: "GET",
    maxBodyLength: Infinity,
    headers: myHeaders,
    redirect: "follow",
  };
  try {
    const response = await fetch(
      "https://interactivewallgallery.blob.core.windows.net/gallery?restype=container&comp=list",
      requestOptions
    );
    const data = await response.text();
    // Save the data to a variable
    const myData = data;
    // console.log(`this is the variable being awaited and saved: ${myData}`);
    res.send(myData);
    // return new Response(json);
  } catch (error) {
    console.error("Error:", error);
  }
}
