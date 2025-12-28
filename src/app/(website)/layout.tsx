import type { Metadata } from "next";

import "../globals.css";

export const metadata: Metadata = {
  title: "Quick Chat",
  description:
    "Quick Chat is a simple file sharing app that allows you to share files with others.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
