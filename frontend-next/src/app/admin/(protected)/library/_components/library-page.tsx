'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Copy, ExternalLink, Film, Search, Trash2, Upload, X } from 'lucide-react';
import {
  libraryService,
  LIBRARY_QUERY_KEY,
  type LibraryImage,
  type LibraryKind,
} from '@/app/admin/_lib/library.service';
import { Pagination } from '@/app/admin/_components/data-table/pagination';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { useImageCompressConfirm } from '@/app/admin/_components/image-compress-dialog/image-compress-dialog';

/**
 * Thư viện media: ảnh (uploads/library…) và video (uploads/videos) chung một chỗ.
 * Ảnh qua hộp thoại nén rồi upload; video upload thẳng (tới 200MB, có % tiến trình).
 * Lọc theo loại / thư mục, xem chi tiết, copy URL, xóa.
 */

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Đã copy URL');
  } catch {
    toast.error('Không copy được URL');
  }
}

export function LibraryScreen() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('all');
  const [type, setType] = useState<LibraryKind | 'all'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [uploading, setUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const { confirmCompress, dialog: compressDialog } = useImageCompressConfirm();
  const [selected, setSelected] = useState<LibraryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, folder, type, limit]);

  const params = useMemo(
    () => ({ page, limit, search, folder, type }),
    [page, limit, search, folder, type],
  );

  const { data, isFetching } = useQuery({
    queryKey: [...LIBRARY_QUERY_KEY, params],
    queryFn: () => libraryService.list(params),
    placeholderData: keepPreviousData,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const folders = data?.folders ?? [];
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const currentPage = meta?.page ?? page;
  const total = meta?.total ?? items.length;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(currentPage * limit, total);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const picked = await confirmCompress(files);
    if (!picked) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploading(true);
    const target = folder === 'all' || folder === 'videos' ? 'library' : folder;
    let ok = 0;
    for (const file of picked) {
      try {
        await libraryService.upload(file, target);
        ok += 1;
      } catch {
        toast.error(`Không tải được "${file.name}"`);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (ok > 0) {
      toast.success(`Đã tải lên ${ok} file`);
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    }
  }

  async function handleUploadVideo(files: FileList | null) {
    if (!files || files.length === 0) return;
    let ok = 0;
    for (const file of Array.from(files)) {
      if (!VIDEO_TYPES.includes(file.type)) {
        toast.error(`"${file.name}": chỉ nhận MP4, WebM hoặc MOV`);
        continue;
      }
      setVideoProgress(0);
      try {
        await libraryService.uploadVideo(file, setVideoProgress);
        ok += 1;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Không tải được "${file.name}"`);
      }
    }
    setVideoProgress(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (ok > 0) {
      toast.success(`Đã tải lên ${ok} video`);
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    }
  }

  async function onDelete(item: LibraryImage) {
    const ok = await confirmAction(
      {
        title: 'Xóa file?',
        text: `"${item.name}" sẽ bị xóa vĩnh viễn. Nội dung đang dùng file này sẽ mất ${item.kind === 'video' ? 'video' : 'ảnh'}.`,
        confirmButtonText: 'Xóa',
      },
      () => libraryService.remove(item.path),
    );
    if (ok) {
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    }
  }

  const busy = uploading || videoProgress !== null;

  return (
    <div>
      {compressDialog}
      <div className="adm-page-header is-row">
        <div>
          <h1 className="adm-page-title">Thư viện ảnh &amp; video</h1>
          <p className="adm-page-subtitle">
            {meta?.total ?? 0} file · {formatBytes(data?.totalSize ?? 0)}
            {videoProgress !== null && ` · đang tải video ${videoProgress}%`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="lib-hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            className="lib-hidden"
            onChange={(e) => handleUploadVideo(e.target.files)}
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={busy}
            className="adm-btn"
          >
            {videoProgress !== null ? <span className="adm-spin" /> : <Film size={16} />}
            Tải video lên
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="adm-btn adm-btn--primary"
          >
            {uploading ? <span className="adm-spin" /> : <Upload size={16} />}
            Tải ảnh lên
          </button>
        </div>
      </div>

      <div className="dt-toolbar">
        <div className="dt-search">
          <Search size={16} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm file…"
          />
        </div>
        <select
          className="dt-filter"
          value={type}
          onChange={(e) => setType(e.target.value as LibraryKind | 'all')}
        >
          <option value="all">Ảnh + video</option>
          <option value="image">Chỉ ảnh</option>
          <option value="video">Chỉ video</option>
        </select>
        <select className="dt-filter" value={folder} onChange={(e) => setFolder(e.target.value)}>
          <option value="all">Tất cả thư mục</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="lb-card">
        {isFetching && items.length === 0 ? (
          <p className="lb-msg">Đang tải…</p>
        ) : items.length === 0 ? (
          <p className="lb-msg">Chưa có file nào. Bấm Tải ảnh lên / Tải video lên để thêm.</p>
        ) : (
          <div className="lb-grid">
            {items.map((item) => (
              <div key={item.path} className="lb-item">
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="lb-thumb"
                  title="Xem chi tiết"
                >
                  {item.kind === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={item.url} preload="metadata" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.name} />
                  )}
                  {item.kind === 'video' && (
                    <span className="lb-kind-badge">
                      <Film size={11} /> video
                    </span>
                  )}
                  <span className="lb-item-actions">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(item.url);
                      }}
                      aria-label="Copy URL"
                      title="Copy URL"
                    >
                      <Copy size={13} />
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Mở tab mới"
                      title="Mở"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <span
                      role="button"
                      tabIndex={0}
                      className="lb-del"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                      aria-label="Xóa"
                      title="Xóa"
                    >
                      <Trash2 size={13} />
                    </span>
                  </span>
                </button>
                <div className="lb-item-meta">
                  <p className="lb-item-name" title={item.name}>
                    {item.name}
                  </p>
                  <p className="lb-item-sub">
                    {item.folder} · {formatBytes(item.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <Pagination
            className="lb-paging"
            page={currentPage}
            totalPages={totalPages}
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={setLimit}
            pageSizeOptions={[12, 24, 48, 96]}
            unit="file"
          />
        )}
      </div>

      {selected && (
        <DetailModal
          key={selected.path}
          item={selected}
          onClose={() => setSelected(null)}
          onDelete={() => onDelete(selected)}
        />
      )}
    </div>
  );
}

function DetailModal({
  item,
  onClose,
  onDelete,
}: {
  item: LibraryImage;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const isVideo = item.kind === 'video';

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-detail" onClick={(e) => e.stopPropagation()}>
        <div className="lb-detail-preview">
          {isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={item.url}
              controls
              preload="metadata"
              onLoadedMetadata={(e) =>
                setDims({ w: e.currentTarget.videoWidth, h: e.currentTarget.videoHeight })
              }
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.name}
              onLoad={(e) =>
                setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
              }
            />
          )}
        </div>

        <div className="lb-detail-info">
          <div className="lb-detail-head">
            <h3 title={item.name}>{item.name}</h3>
            <button type="button" onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </button>
          </div>

          <dl className="lb-detail-rows">
            <Row label="Loại" value={isVideo ? 'Video' : 'Ảnh'} />
            <Row
              label="Kích thước"
              value={
                dims
                  ? `${dims.w} × ${dims.h} px${isVideo ? (dims.h > dims.w ? ' · dọc 9:16' : ' · ngang 16:9') : ''}`
                  : 'Đang tải…'
              }
            />
            <Row label="Dung lượng" value={formatBytes(item.size)} />
            <Row label="Thư mục" value={item.folder} />
            <Row label="Định dạng" value={item.extension.toUpperCase()} />
            <Row label="Sửa lần cuối" value={new Date(item.modifiedAt).toLocaleString('vi-VN')} />
            <div>
              <dt>URL</dt>
              <div className="lb-detail-url">
                <input readOnly value={item.url} onFocus={(e) => e.currentTarget.select()} />
                <button type="button" onClick={() => copyUrl(item.url)} title="Copy URL">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </dl>

          <div className="lb-detail-actions">
            <a href={item.url} target="_blank" rel="noreferrer" className="adm-btn">
              <ExternalLink size={15} /> Mở
            </a>
            <button type="button" onClick={onDelete} className="adm-btn lb-btn-danger">
              <Trash2 size={15} /> Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="lb-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
