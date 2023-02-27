import "./globals.css";

export const metadata = {
  title: "Interactive wall",
  description: "Digital Experience for Employees",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
