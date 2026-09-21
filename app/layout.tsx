import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Field Notes From Everywhere",
    template: "%s · Field Notes From Everywhere",
  },
  description:
    "Book recommendations, backed by real reader discussions. The Field Notes From Everywhere Publication and The Reading Room.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
