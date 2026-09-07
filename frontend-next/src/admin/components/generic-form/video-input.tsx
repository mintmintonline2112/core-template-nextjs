'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FolderOpen, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { libraryService } from '@/admin/features/library/library.service';
import { LibraryPicker } from '@/admin/features/library/library-picker';
import { resolveImageUrl } from '@/admin/lib/utils';
import { guessOrientation, isExternalVideo } from '@/lib/video';

/**
 * Ô "Video" cho GenericForm: tải MP4/WebM/MOV lên (tới 200MB, có thanh tiến
 * trình) HOẶC dán link YouTube/Vimeo. Hướng video (ngang 16:9 / dọc 9:16) tự
 * nhận từ kích thước file sau khi upload (link YouTube Shorts → dọc), admin
 * vẫn đổi tay được. Giá trị trả ra: (path|url, orientation).
 */

export type VideoOrientation = 'landscape' | 'portrait';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_MB = 200;

const isExternal = isExternalVideo;

/** Đọc kích thước khung hình để đoán hướng — nhận object URL (file vừa chọn) hoặc URL trên server. */
function detectFromSrc(src: string): Promise<VideoOrientation> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () =>
      resolve(video.videoHeight > video.videoWidth ? 'portrait' : 'landscape');
    video.onerror = () => resolve('landscape');
    video.src = src;
  });
}

async function detectFromFile(file: File): Promise<VideoOrientation> {
  const url = URL.createObjectURL(file);
  try {
    return await detectFromSrc(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function VideoInput({
  value,
  orientation,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  orientation: VideoOrientation | '';
  onChange: (path: string, orientation: VideoOrientation | '') => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const radioName = useId();
  const [progress, setProgress] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const current = orientation || 'landscape';
  const external = isExternal(value);
  const preview = value ? (external ? value : resolveImageUrl(value)) : null;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error('Chỉ nhận video MP4, WebM hoặc MOV');
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video tối đa ${MAX_VIDEO_MB}MB — nén bớt rồi tải lại`);
      return;
    }
    setProgress(0);
    try {
      const [detected, uploaded] = await Promise.all([
        detectFromFile(file),
        libraryService.uploadVideo(file, setProgress),
      ]);
      onChange(uploaded.path, detected);
      toast.success('Đã tải video lên');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tải video thất bại');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function pickFromLibrary(url: string) {
    const detected = await detectFromSrc(resolveImageUrl(url) ?? url);
    onChange(url, detected);
  }

  function commitLink(raw: string) {
    const link = raw.trim();
    if (!link) {
      onChange('', '');
      return;
    }
    onChange(link, guessOrientation(link, current));
  }

  return (
    <div className="gf-video">
      <div className="gf-imageurl-row">
        <input
          className="gf-control"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commitLink(draft)}
          placeholder={placeholder ?? 'Dán link YouTube / Vimeo, hoặc bấm Tải video lên'}
          disabled={disabled || progress !== null}
        />
        <button
          type="button"
          className="adm-btn"
          onClick={() => setPickerOpen(true)}
          disabled={disabled || progress !== null}
          title="Chọn video đã có trong Thư viện"
        >
          <FolderOpen size={14} /> Thư viện
        </button>
        <button
          type="button"
          className="adm-btn"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || progress !== null}
        >
          <Upload size={14} /> Tải video lên
        </button>
        {value && !disabled && (
          <button
            type="button"
            className="adm-btn"
            onClick={() => onChange('', '')}
            aria-label="Bỏ video"
            title="Bỏ video"
          >
            <X size={14} />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <LibraryPicker
        open={pickerOpen}
        kind="video"
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => void pickFromLibrary(url)}
      />

      {progress !== null && (
        <div className="gf-video-progress" role="progressbar" aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
          <small>Đang tải… {progress}%</small>
        </div>
      )}

      {value && (
        <div className="gf-video-meta">
          <div className={`gf-video-preview is-${current}`}>
            {external ? (
              <div className="gf-video-link">Link ngoài: {value}</div>
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={preview ?? undefined} controls preload="metadata" />
            )}
          </div>
          <div className="gf-video-orient" role="radiogroup" aria-label="Hướng video">
            {(
              [
                ['landscape', 'Ngang 16:9'],
                ['portrait', 'Dọc 9:16'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={`gf-video-orient-opt${current === key ? ' is-active' : ''}`}>
                <input
                  type="radio"
                  name={radioName}
                  checked={current === key}
                  onChange={() => onChange(value, key)}
                  disabled={disabled}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
