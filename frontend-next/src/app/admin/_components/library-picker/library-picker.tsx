'use client';

import './library-picker.css';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { X, Search, Upload, Film } from 'lucide-react';
import { useImageCompressConfirm } from '@/app/admin/_components/image-compress-dialog/image-compress-dialog';
import { libraryService, type LibraryImage, type LibraryKind } from '@/app/admin/_lib/library.service';
import { resolveImageUrl } from '@/app/admin/_lib/utils';

/**
 * Media Library picker — duyệt file đã upload (tìm + lọc thư mục) hoặc tải mới,
 * trả về URL đã chọn. `kind` quyết định thư viện ảnh (mặc định) hay video:
 * ảnh đi qua hộp thoại nén, video upload thẳng (tới 200MB, có % tiến trình).
 */
export function LibraryPicker({
  open,
  onClose,
  onSelect,
  kind = 'image',
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  kind?: LibraryKind;
}) {
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [items, setItems] = useState<LibraryImage[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const { confirmCompress, dialog: compressDialog } = useImageCompressConfirm();
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVideo = kind === 'video';

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(() => {
      libraryService
        .list({ search: search.trim(), folder, limit: 60, type: kind })
        .then((res) => {
          setItems(res.data ?? []);
          setFolders(res.folders ?? []);
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [open, search, folder, refreshKey, kind]);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (isVideo) {
      setUploading(true);
      setProgress(0);
      try {
        const video = await libraryService.uploadVideo(file, setProgress);
        toast.success('Đã tải video lên');
        onSelect(video.url);
        onClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Tải video thất bại');
        setRefreshKey((k) => k + 1);
      } finally {
        setUploading(false);
        setProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }
    const picked = await confirmCompress([file]);
    if (!picked) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const img = await libraryService.upload(picked[0], folder || 'library');
      toast.success('Đã tải ảnh lên');
      onSelect(img.url);
      onClose();
    } catch {
      toast.error('Tải ảnh thất bại');
      setRefreshKey((k) => k + 1);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!open) return null;

  return (
    <>
    {compressDialog}
    <div className="lib-overlay" onClick={onClose}>
      <div className="lib-modal" onClick={(e) => e.stopPropagation()}>
        <header className="lib-head">
          <h3>{isVideo ? 'Thư viện video' : 'Thư viện ảnh'}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </header>

        <div className="lib-toolbar">
          <div className="lib-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isVideo ? 'Tìm video…' : 'Tìm ảnh…'}
            />
          </div>
          <select value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="">Tất cả thư mục</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept={isVideo ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'}
            className="lib-hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <button type="button" className="lib-upload" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? <span className="lib-spin" /> : isVideo ? <Film size={15} /> : <Upload size={15} />}
            {progress !== null ? `Đang tải ${progress}%` : 'Tải lên'}
          </button>
        </div>

        <div className="lib-body">
          {loading ? (
            <p className="lib-msg">Đang tải…</p>
          ) : items.length === 0 ? (
            <p className="lib-msg">{isVideo ? 'Chưa có video nào.' : 'Chưa có ảnh nào.'} Bấm Tải lên để thêm.</p>
          ) : (
            <div className="lib-grid">
              {items.map((im) => (
                <button
                  key={im.path}
                  type="button"
                  className="lib-item"
                  title={im.name}
                  onClick={() => {
                    onSelect(im.url);
                    onClose();
                  }}
                >
                  {im.kind === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={resolveImageUrl(im.url) ?? im.url} preload="metadata" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImageUrl(im.url) ?? im.url} alt={im.name} />
                  )}
                  {im.kind === 'video' && <span className="lib-kind">video</span>}
                  <span>{im.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
