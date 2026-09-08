'use client';

import { useMemo } from 'react';
import { RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { resolveImageUrl } from '@/app/admin/_lib/utils';
import {
  parseGalleryImages,
  useImageOrientations,
  type GalleryImage,
} from '@/lib/gallery-orientation';

/**
 * Xem trước phân khu cho kiểu hiển thị "Bộ sưu tập ảnh": hiện ngay dưới
 * editor nội dung, chia ảnh trong nội dung thành 2 khu Khổ ngang / Khổ dọc
 * bằng đúng logic đo ảnh của gallery ngoài website — admin nhìn là biết
 * tấm nào sẽ nằm khu nào trước khi lưu.
 */

// Truyền hàm module-level (không tạo mới mỗi render) để effect trong hook
// useImageOrientations không chạy lại theo mỗi lần gõ phím.
const resolveSrc = (src: string) => resolveImageUrl(src) ?? src;

function ZoneThumbs({ images }: { images: GalleryImage[] }) {
  return (
    <div className="gzp-thumbs">
      {images.map((image, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${image.src}-${index}`}
          src={resolveSrc(image.src)}
          alt={image.alt || `Ảnh ${index + 1}`}
          loading="lazy"
        />
      ))}
    </div>
  );
}

export function GalleryZonePreview({ html }: { html: string }) {
  const images = useMemo(() => parseGalleryImages(html).images, [html]);
  const orientations = useImageOrientations(images, resolveSrc);

  if (images.length === 0) {
    return (
      <div className="gzp gzp--empty">
        Chưa có ảnh nào trong nội dung — bấm nút <strong>chèn ảnh</strong> trên
        thanh công cụ của editor, ảnh sẽ tự chia khu ngang / dọc ngoài website.
      </div>
    );
  }

  const landscape = images.filter((i) => orientations[i.src] === 'landscape');
  const portrait = images.filter((i) => orientations[i.src] === 'portrait');
  const measuring = images.length - landscape.length - portrait.length;

  return (
    <div className="gzp">
      <p className="gzp-title">
        Xem trước phân khu ngoài website
        {measuring > 0 && <span className="gzp-measuring">đang đo {measuring} ảnh…</span>}
      </p>
      <div className="gzp-zones">
        <div className="gzp-zone">
          <p className="gzp-zone-head">
            <RectangleHorizontal size={14} />
            Khổ ngang · {landscape.length} ảnh
            <span>lưới ~2 cột</span>
          </p>
          {landscape.length > 0 ? (
            <ZoneThumbs images={landscape} />
          ) : (
            <p className="gzp-zone-empty">Không có ảnh ngang</p>
          )}
        </div>
        <div className="gzp-zone">
          <p className="gzp-zone-head">
            <RectangleVertical size={14} />
            Khổ dọc · {portrait.length} ảnh
            <span>lưới ~3 cột</span>
          </p>
          {portrait.length > 0 ? (
            <ZoneThumbs images={portrait} />
          ) : (
            <p className="gzp-zone-empty">Không có ảnh dọc</p>
          )}
        </div>
      </div>
      <p className="gzp-note">
        Khu xếp theo chiều thật của ảnh (ngang → khu ngang, dọc → khu dọc);
        thứ tự trong mỗi khu theo thứ tự chèn trong nội dung. Nhãn khu ngoài
        website chỉ hiện khi có đủ cả hai loại ảnh.
      </p>
    </div>
  );
}
