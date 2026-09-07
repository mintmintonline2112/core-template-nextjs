/**
 * Nén ảnh NGAY TRÊN TRÌNH DUYỆT (canvas) trước khi upload — cùng luật với backend
 * (image-optimizer.helper.ts) để người dùng xem trước "trước/sau" và tự quyết
 * định. Backend vẫn nén lại như lưới an toàn nếu ảnh gửi lên còn nặng.
 *
 * - Cạnh dài tối đa 1920px, không phóng to.
 * - JPEG/WebP: quality 0.82 → hạ dần tới 0.6 tới khi ≤ ~1MB.
 * - PNG trong suốt: giữ PNG (chỉ resize). PNG không trong suốt → JPEG.
 * - Ảnh nhỏ (≤ SKIP_BELOW và ≤ 1920px) hoặc GIF/SVG: không nén (skip=true).
 */

export const CLIENT_COMPRESS = {
  MAX_EDGE: 1920,
  TARGET_BYTES: 1024 * 1024,
  QUALITY: 0.82,
  MIN_QUALITY: 0.6,
  SKIP_BELOW_BYTES: 300 * 1024,
} as const;

/** Tùy chọn người dùng chọn trong hộp thoại. maxEdge=0 → giữ kích thước gốc. */
export type CompressOptions = {
  maxEdge: number;
  targetBytes: number;
};

export const EDGE_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 0, label: 'Giữ nguyên', hint: 'Không thu nhỏ' },
  { value: 2560, label: '2560px', hint: 'Màn hình lớn / ảnh nền' },
  { value: 1920, label: '1920px', hint: 'Khuyên dùng cho web' },
  { value: 1280, label: '1280px', hint: 'Ảnh trong bài viết' },
  { value: 800, label: '800px', hint: 'Thumbnail / avatar' },
];

export const SIZE_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 2 * 1024 * 1024, label: 'Cao', hint: '~2 MB' },
  { value: 1024 * 1024, label: 'Chuẩn', hint: '~1 MB' },
  { value: 512 * 1024, label: 'Nhẹ', hint: '~500 KB' },
  { value: 256 * 1024, label: 'Rất nhẹ', hint: '~250 KB' },
];

export const DEFAULT_COMPRESS_OPTIONS: CompressOptions = {
  maxEdge: CLIENT_COMPRESS.MAX_EDGE,
  targetBytes: CLIENT_COMPRESS.TARGET_BYTES,
};

export type CompressResult = {
  original: File;
  /** File sau khi nén (= original nếu skip). */
  file: File;
  skip: boolean;
  reason?: string;
  width: number;
  height: number;
  outWidth: number;
  outHeight: number;
  previewUrl: string; // object URL của file kết quả — nhớ revoke
};

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** PNG có kênh alpha thật không (kiểm tra mẫu pixel). */
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 4000))); // ~4000 mẫu
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] < 250) return true;
    }
  }
  return false;
}

function renameExt(name: string, ext: string): string {
  return name.replace(/\.[^.]+$/, '') + ext;
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = DEFAULT_COMPRESS_OPTIONS,
): Promise<CompressResult> {
  const maxEdge = options.maxEdge > 0 ? options.maxEdge : Number.POSITIVE_INFINITY;
  const targetBytes = options.targetBytes;
  const type = file.type;
  const skipResult = (reason: string, w = 0, h = 0): CompressResult => ({
    original: file,
    file,
    skip: true,
    reason,
    width: w,
    height: h,
    outWidth: w,
    outHeight: h,
    previewUrl: URL.createObjectURL(file),
  });

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
    return skipResult('Định dạng này không nén (GIF/SVG…)');
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    return skipResult('Không đọc được ảnh — giữ nguyên');
  }
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const tooLarge = Math.max(w, h) > maxEdge;
  const tooHeavy = file.size > CLIENT_COMPRESS.SKIP_BELOW_BYTES;
  if (!tooLarge && !tooHeavy) return skipResult('Ảnh đã đủ nhẹ', w, h);

  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const ow = Math.max(1, Math.round(w * scale));
  const oh = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = ow;
  canvas.height = oh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return skipResult('Trình duyệt không hỗ trợ canvas', w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, ow, oh);

  let outType = type;
  if (type === 'image/png') {
    outType = hasTransparency(ctx, ow, oh) ? 'image/png' : 'image/jpeg';
  }

  let blob: Blob | null = null;
  if (outType === 'image/png') {
    blob = await canvasToBlob(canvas, 'image/png');
  } else {
    // mục tiêu càng cao → khởi điểm quality càng cao (Cao: 0.9, Chuẩn: 0.82, Nhẹ: 0.78)
    let q: number =
      targetBytes >= 2 * 1024 * 1024 ? 0.9 : targetBytes >= 1024 * 1024 ? CLIENT_COMPRESS.QUALITY : 0.78;
    blob = await canvasToBlob(canvas, outType, q);
    while (blob && blob.size > targetBytes && q > CLIENT_COMPRESS.MIN_QUALITY) {
      q = Math.max(CLIENT_COMPRESS.MIN_QUALITY, q - 0.08);
      blob = await canvasToBlob(canvas, outType, q);
    }
  }
  if (!blob || blob.size >= file.size) {
    // nén không lợi → giữ nguyên
    return skipResult('Nén không giảm được thêm', w, h);
  }

  const ext = outType === 'image/png' ? '.png' : outType === 'image/webp' ? '.webp' : '.jpg';
  const out = new File([blob], renameExt(file.name, ext), { type: outType, lastModified: Date.now() });
  return {
    original: file,
    file: out,
    skip: false,
    width: w,
    height: h,
    outWidth: ow,
    outHeight: oh,
    previewUrl: URL.createObjectURL(out),
  };
}
