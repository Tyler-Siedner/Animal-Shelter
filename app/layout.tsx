// Authors: Tyler Siedner and Tyler Harris
import type { Metadata } from "next";
import "./globals.css";
import "./site.css";

export const metadata: Metadata = {
  title: {
    default: "Weyland-Yutani Animal Shelter",
    template: "%s | Weyland-Yutani",
  },
  description:
    "Building Better Companions. A fictional interstellar animal shelter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
