import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {/* antialiased: make fonts render more smoothly */}
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
