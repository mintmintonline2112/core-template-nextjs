/**
 * Cấu hình postcss riêng (Tailwind v4). Next.js dùng đúng file này thay cho
 * postcss mặc định — Tailwind v4 tự bundle @import và tự thêm vendor prefix
 * (qua Lightning CSS) nên không cần thêm autoprefixer/postcss-import nữa.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
