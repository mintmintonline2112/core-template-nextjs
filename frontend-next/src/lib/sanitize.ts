import sanitizeHtml from 'sanitize-html';
import { env } from '@/lib/env';

/**
 * Sanitize rich text do admin soạn (RichTextEditor/Tiptap) trước khi render bằng
 * dangerouslySetInnerHTML. Loại bỏ <script>, on* handler và javascript:/data: URL —
 * giữ lại các thẻ định dạng, link, ảnh (kèm width/căn lề) và nút a.btn.
 *
 * Chạy server-side (Server Components) nên dữ liệu bẩn có sẵn trong DB cũng bị
 * trung hòa tại thời điểm render.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'h2',
    'h3',
    'u',
    's',
    'span',
    'figure',
    'figcaption',
    'iframe',
    'video',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'data-align', 'style'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'loading'],
    figure: ['class', 'data-video', 'data-orientation', 'data-src'],
    video: ['src', 'poster', 'controls', 'playsinline', 'preload'],
    p: ['style'],
    h2: ['style'],
    h3: ['style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|center|right|justify)$/],
      display: [/^block$/],
      'margin-left': [/^auto$/],
      'margin-right': [/^auto$/],
      width: [/^\d+px$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'], video: ['http', 'https'] },
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
    'player.vimeo.com',
  ],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

/**
 * Ảnh/video trong nội dung có thể được lưu dạng uploads/..., /uploads/... hoặc
 * URL tuyệt đối của môi trường soạn thảo (http://localhost:3010/uploads/...).
 * Chuẩn hóa tất cả về origin public của môi trường đang chạy.
 */
function absolutizeUploadSrc(html: string): string {
  const origin = new URL(env.publicApiUrl).origin;
  return html.replace(
    /src="(?:https?:\/\/[^"/]+)?\/?uploads\//g,
    `src="${origin}/uploads/`,
  );
}

export function sanitizeRichText(html?: string | null): string {
  if (!html) return '';
  return absolutizeUploadSrc(sanitizeHtml(html, OPTIONS));
}
