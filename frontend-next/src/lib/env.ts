const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const env = {
  apiUrl: trimTrailingSlash(
    process.env.API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3010/api",
  ),
  /**
   * URL API mà TRÌNH DUYỆT truy cập được — dùng cho src ảnh, link công khai.
   * Khác apiUrl: trên VPS apiUrl là 127.0.0.1 nội bộ (server-to-server).
   */
  publicApiUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL ??
      process.env.API_URL ??
      "http://localhost:3010/api",
  ),
  siteUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
} as const;
