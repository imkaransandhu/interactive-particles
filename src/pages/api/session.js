import cookie from "cookie";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  // Set the session duration to 1 minute
  const sessionDuration = 60;

  if (req.method === "GET" && req.url === "/main") {
    // Generate a new GUID for the session
    const sessionGuid = uuidv4();

    // Set the session GUID as a cookie on the response
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("sessionGuid", sessionGuid, {
        httpOnly: true,
        maxAge: sessionDuration,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    );

    // Render the QR code with the session URL and GUID
    const sessionUrl = `http://localhost:3000/session?sessionGuid=${sessionGuid}`;
    return res.status(200).json({ qrCodeUrl: generateQrCode(sessionUrl) });
  } else {
    // For all other routes, check if a valid session exists before proceeding
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token;
    const sessionGuid = cookies.sessionGuid;

    try {
      // Verify the token to check if the session is still valid
      const decodedToken = jwt.verify(token, "secret");
      req.userId = decodedToken.userId;

      // Check if the session GUID in the cookie matches the one provided in the request
      if (req.query.sessionGuid !== sessionGuid) {
        return res.status(401).json({ message: "Invalid session GUID" });
      }

      return res.status(200).json({ message: "Valid session!" });
    } catch (err) {
      // If the token is invalid or has expired, redirect to the login page
      return res.redirect("/");
    }
  }
}
