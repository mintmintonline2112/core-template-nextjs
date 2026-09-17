'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { LibraryPicker } from '@/app/admin/_components/library-picker/library-picker';
import { FocalPointPicker } from '@/app/admin/(protected)/page-sections/_components/focal-point-picker';

/**
 * Ảnh nền dải tiêu đề đầu trang (PageHero): gõ đường dẫn hoặc chọn từ Thư viện,
 * rồi bấm / kéo lên ảnh để chọn điểm lấy nét. Website làm nhoè ảnh và phủ navy
 * phía sau tiêu đề; để trống thì dùng ảnh vườn hạnh nhân mặc định.
 */
export function HeroImageField({
  image,
  position,
  onImageChange,
  onPositionChange,
}: {
  image: string;
  position: string;
  onImageChange: (next: string) => void;
  onPositionChange: (next: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="gf-field" style={{ marginTop: 18 }}>
      <label className="gf-label">Ảnh nền đầu trang</label>
      <div className="me-image-row">
        <input
          className="gf-control"
          value={image}
          placeholder="Trống = ảnh vườn hạnh nhân mặc định"
          onChange={(e) => onImageChange(e.target.value)}
        />
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => setPickerOpen(true)}>
          <ImageIcon size={13} /> Thư viện
        </button>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="me-thumb" src={image} alt="" />
        ) : null}
      </div>
      <p className="gf-hint">
        Ảnh được làm nhoè nhẹ và phủ lớp navy phía sau tiêu đề trang (đậm bên trái, nhạt dần sang phải).
      </p>
      {image ? (
        <FocalPointPicker
          url={image}
          value={position || undefined}
          onChange={(next) => onPositionChange(next ?? '')}
          previews={[
            { label: 'Máy tính (dải ngang dẹt)', width: 220, height: 56 },
            { label: 'Điện thoại', width: 78, height: 96 },
          ]}
        />
      ) : null}

      {pickerOpen ? (
        <LibraryPicker
          open
          onClose={() => setPickerOpen(false)}
          onSelect={(url) => {
            onImageChange(url);
            setPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
