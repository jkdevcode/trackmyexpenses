import React from "react";

import { Provider } from "./provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
