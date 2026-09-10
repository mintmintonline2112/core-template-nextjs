import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  /**
   * Deploy build ra thư mục tạm (NEXT_DIST_DIR=.next-build) rồi tráo vào .next,
   * nhờ vậy site đang chạy không bị mất file chunk giữa chừng → hết lỗi
   * "Application error: a client-side exception". Runtime luôn đọc .next.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
