import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { env } from "@/lib/env";
import "@/styles/tailwind.css";

/**
 * Chỉ giữ phần dùng chung cho CẢ site lẫn admin. Title/description/OG của site
 * public nằm ở app/(site)/layout.tsx; admin tự khai báo (noindex) ở app/admin/layout.tsx.
 */
export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
