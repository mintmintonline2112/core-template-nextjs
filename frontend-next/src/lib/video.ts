/**
 * Video trong CMS: file upload (uploads/videos/...) hoặc link YouTube/Vimeo.
 * Dùng chung cho admin (editor, ô video bài viết) và public (render).
 */

export type VideoOrientation = "landscape" | "portrait";
export type VideoProvider = "file" | "youtube" | "vimeo";

export function isExternalVideo(value: string): boolean {
  return /^https?:\/\//i.test(value) && !/\/uploads\//i.test(value);
}

/** Link YouTube/Vimeo → URL nhúng iframe; host khác → null (không nhúng). */
export function embedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const short = url.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/);
    const id = short?.[1] ?? url.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

export function videoProvider(value: string): VideoProvider {
  if (!isExternalVideo(value)) return "file";
  return /vimeo\.com/i.test(value) ? "vimeo" : "youtube";
}

/** Đoán hướng từ link: YouTube Shorts là dọc, còn lại ngang. */
export function guessOrientation(value: string, fallback: VideoOrientation = "landscape"): VideoOrientation {
  return /\/shorts\//i.test(value) ? "portrait" : fallback;
}
