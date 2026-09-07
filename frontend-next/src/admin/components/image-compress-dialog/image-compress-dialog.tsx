'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  compressImageFile,
  formatBytes,
  DEFAULT_COMPRESS_OPTIONS,
  EDGE_PRESETS,
  SIZE_PRESETS,
  type CompressOptions,
  type CompressResult,
} from '@/admin/lib/image-compress';
import './image-compress-dialog.css';

/**
 * Hộp xác nhận nén ảnh trước khi upload. Dùng qua hook `useImageCompressConfirm`:
 *
 *   const { confirmCompress, dialog } = useImageCompressConfirm();
 *   const files = await confirmCompress(selectedFiles);   // null = người dùng hủy
 *   ...render {dialog} ở cuối component
 *
 * Người dùng chọn kích thước (cạnh dài) + mức dung lượng, số liệu trước/sau
 * cập nhật ngay. Ảnh đã nhẹ với mặc định thì không mở hộp thoại.
 * Lựa chọn gần nhất được nhớ trong localStorage cho lần sau.
 */

const PREF_KEY = 'ssd-admin-compress-pref';

function loadPref(): CompressOptions {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT_COMPRESS_OPTIONS;
    const p = JSON.parse(raw) as Partial<CompressOptions>;
    const edgeOk = EDGE_PRESETS.some((e) => e.value === p.maxEdge);
    const sizeOk = SIZE_PRESETS.some((s) => s.value === p.targetBytes);
    return {
      maxEdge: edgeOk ? (p.maxEdge as number) : DEFAULT_COMPRESS_OPTIONS.maxEdge,
      targetBytes: sizeOk ? (p.targetBytes as number) : DEFAULT_COMPRESS_OPTIONS.targetBytes,
    };
  } catch {
    return DEFAULT_COMPRESS_OPTIONS;
  }
}
function savePref(o: CompressOptions) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

type PendingState = {
  originals: File[];
  results: CompressResult[];
  options: CompressOptions;
  resolve: (files: File[] | null) => void;
} | null;

function revokeAll(results: CompressResult[]) {
  for (const r of results) URL.revokeObjectURL(r.previewUrl);
}

export function useImageCompressConfirm() {
  const [pending, setPending] = useState<PendingState>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const pendingRef = useRef<PendingState>(null);
  pendingRef.current = pending;

  const confirmCompress = useCallback(
    (files: File[] | FileList | null | undefined): Promise<File[] | null> => {
      const list = files ? Array.from(files) : [];
      if (!list.length) return Promise.resolve([]);
      setAnalyzing(true);
      return (async () => {
        const options = loadPref();
        const results: CompressResult[] = [];
        for (const f of list) results.push(await compressImageFile(f, options));
        setAnalyzing(false);
        // Với tùy chọn hiện tại mà không ảnh nào cần nén → đi thẳng
        if (results.every((r) => r.skip)) {
          revokeAll(results);
          return list;
        }
        return new Promise<File[] | null>((resolve) => {
          setPending({ originals: list, results, options, resolve });
        });
      })();
    },
    [],
  );

  const finish = useCallback((files: File[] | null) => {
    const p = pendingRef.current;
    if (!p) return;
    revokeAll(p.results);
    setPending(null);
    p.resolve(files);
  }, []);

  /** Đổi tùy chọn → nén lại toàn bộ với tùy chọn mới. */
  const recompute = useCallback(async (options: CompressOptions) => {
    const p = pendingRef.current;
    if (!p) return;
    savePref(options);
    const results: CompressResult[] = [];
    for (const f of p.originals) results.push(await compressImageFile(f, options));
    const cur = pendingRef.current;
    if (!cur) {
      revokeAll(results);
      return;
    }
    revokeAll(cur.results);
    setPending({ ...cur, results, options });
  }, []);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, finish]);

  const dialog = (
    <>
      {analyzing && (
        <div className="icd-overlay" role="status" aria-live="polite">
          <div className="icd-analyzing">
            <Loader2 className="icd-spin" size={18} />
            Đang phân tích ảnh…
          </div>
        </div>
      )}
      {pending && (
        <ImageCompressDialog
          results={pending.results}
          options={pending.options}
          onOptionsChange={recompute}
          onConfirm={() => finish(pending.results.map((r) => r.file))}
          onKeepOriginal={() => finish(pending.originals)}
          onCancel={() => finish(null)}
        />
      )}
    </>
  );

  return { confirmCompress, dialog, analyzing };
}

function ImageCompressDialog({
  results,
  options,
  onOptionsChange,
  onConfirm,
  onKeepOriginal,
  onCancel,
}: {
  results: CompressResult[];
  options: CompressOptions;
  onOptionsChange: (o: CompressOptions) => Promise<void>;
  onConfirm: () => void;
  onKeepOriginal: () => void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const before = results.reduce((s, r) => s + r.original.size, 0);
  const after = results.reduce((s, r) => s + r.file.size, 0);
  const saved = before - after;
  const pct = before ? Math.round((saved / before) * 100) : 0;
  const nothingToDo = results.every((r) => r.skip);

  async function change(patch: Partial<CompressOptions>) {
    setBusy(true);
    try {
      await onOptionsChange({ ...options, ...patch });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="icd-overlay" onClick={onCancel} role="presentation">
      <div
        className="icd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="icd-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icd-head">
          <h2 id="icd-title">Nén ảnh trước khi tải lên</h2>
          <p>
            Ảnh khá nặng. Chọn kích thước và mức dung lượng bên dưới — số liệu cập nhật ngay
            để bạn xem trước rồi mới quyết định.
          </p>
        </div>

        <div className="icd-options">
          <fieldset className="icd-group">
            <legend>Kích thước (cạnh dài)</legend>
            <div className="icd-chips" role="radiogroup" aria-label="Kích thước">
              {EDGE_PRESETS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  role="radio"
                  aria-checked={options.maxEdge === e.value}
                  className={`icd-chip${options.maxEdge === e.value ? ' is-on' : ''}`}
                  disabled={busy}
                  title={e.hint}
                  onClick={() => change({ maxEdge: e.value })}
                >
                  {e.label}
                  <small>{e.hint}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="icd-group">
            <legend>Dung lượng mục tiêu</legend>
            <div className="icd-chips" role="radiogroup" aria-label="Dung lượng">
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={options.targetBytes === s.value}
                  className={`icd-chip${options.targetBytes === s.value ? ' is-on' : ''}`}
                  disabled={busy}
                  title={s.hint}
                  onClick={() => change({ targetBytes: s.value })}
                >
                  {s.label}
                  <small>{s.hint}</small>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <ul className={`icd-list${busy ? ' is-busy' : ''}`} aria-busy={busy}>
          {results.map((r) => (
            <li key={r.original.name + r.original.size} className={r.skip ? 'is-skip' : ''}>
              <div className="icd-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.previewUrl} alt="" />
              </div>
              <div className="icd-info">
                <b title={r.original.name}>{r.original.name}</b>
                {r.skip ? (
                  <small>
                    {formatBytes(r.original.size)}
                    {r.width ? ` · ${r.width}×${r.height}` : ''} — {r.reason ?? 'giữ nguyên'}
                  </small>
                ) : (
                  <small>
                    <span>
                      {formatBytes(r.original.size)}
                      {r.width ? ` · ${r.width}×${r.height}` : ''}
                    </span>
                    <ArrowRight size={12} aria-hidden="true" />
                    <span className="icd-after">
                      {formatBytes(r.file.size)} · {r.outWidth}×{r.outHeight}
                      {r.file.type !== r.original.type ? ' · → JPG' : ''}
                    </span>
                  </small>
                )}
              </div>
              {!r.skip && (
                <span className="icd-badge">
                  −{Math.round(((r.original.size - r.file.size) / r.original.size) * 100)}%
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="icd-summary">
          {busy ? (
            <>
              <Loader2 className="icd-spin" size={14} /> Đang tính lại…
            </>
          ) : (
            <>
              Tổng: <b>{formatBytes(before)}</b> <ArrowRight size={12} aria-hidden="true" />{' '}
              <b className="icd-after">{formatBytes(after)}</b>
              {saved > 0 ? ` — tiết kiệm ${formatBytes(saved)} (${pct}%)` : ' — không thay đổi'}
            </>
          )}
        </div>

        <div className="icd-actions">
          <button type="button" className="adm-btn" onClick={onCancel}>
            Hủy
          </button>
          <button
            type="button"
            className="adm-btn"
            onClick={onKeepOriginal}
            title="Tải ảnh gốc, không nén"
          >
            Giữ nguyên bản gốc
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={onConfirm}
            disabled={busy || nothingToDo}
            autoFocus
          >
            Nén &amp; tải lên
          </button>
        </div>
      </div>
    </div>
  );
}
