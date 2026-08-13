import type { Metadata } from "next";
import "./globals.css";
import { ConsoleShell } from "@/components/aws/ConsoleShell";

export const metadata: Metadata = {
  title: "AWS Route 53 Console",
  description: "Functional clone of the AWS Route53 DNS web application with SQLite WAL backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConsoleShell>{children}</ConsoleShell>
      </body>
    </html>
  );
}
