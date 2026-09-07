'use client';

import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useRef } from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

type ImgAlign = 'left' | 'center' | 'right';

/**
 * Inline image with a drag-to-resize handle. Width is stored as the `width`
 * attribute (px); height stays auto (aspect-locked).
 */
export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const raw = el.getAttribute('width') || (el as HTMLElement).style?.width || '';
          const n = parseInt(String(raw), 10);
          return Number.isFinite(n) && n > 0 ? n : null;
        },
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      align: {
        default: 'left',
        parseHTML: (el) => (el.getAttribute('data-align') as ImgAlign) || 'left',
        renderHTML: (attrs) => {
          const a = attrs.align as ImgAlign;
          if (a === 'center') {
            return { 'data-align': 'center', style: 'display:block;margin-left:auto;margin-right:auto' };
          }
          if (a === 'right') {
            return { 'data-align': 'right', style: 'display:block;margin-left:auto' };
          }
          return { 'data-align': 'left' };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

function ImageNodeView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const width = node.attrs.width as number | null;

  function onResizeStart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;
    const startX = e.clientX;
    const startW = img.offsetWidth;
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(40, Math.round(startW + (ev.clientX - startX)));
      updateAttributes({ width: w });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const img = imgRef.current;
  const shownW = width ?? img?.offsetWidth ?? null;
  const shownH =
    shownW && img?.naturalWidth ? Math.round((shownW * img.naturalHeight) / img.naturalWidth) : null;
  const align = (node.attrs.align as ImgAlign) || 'left';

  const alignBtns: { a: ImgAlign; icon: React.ReactNode }[] = [
    { a: 'left', icon: <AlignLeft size={13} /> },
    { a: 'center', icon: <AlignCenter size={13} /> },
    { a: 'right', icon: <AlignRight size={13} /> },
  ];

  return (
    <NodeViewWrapper className="rte-img-block" style={{ textAlign: align }}>
      <span className="rte-img-wrap" data-selected={selected ? 'true' : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ''}
          className="rte-img"
          style={{ width: width ? `${width}px` : undefined }}
          draggable={false}
        />
        {editor.isEditable && selected && (
          <>
            <span className="rte-img-tools" contentEditable={false} onMouseDown={(e) => e.stopPropagation()}>
              <span className="rte-img-row">
                <span className="rte-img-aligns">
                  {alignBtns.map((b) => (
                    <button
                      key={b.a}
                      type="button"
                      className={align === b.a ? 'is-active' : undefined}
                      onClick={() => updateAttributes({ align: b.a })}
                      title={`Align ${b.a}`}
                    >
                      {b.icon}
                    </button>
                  ))}
                </span>
                W
                <input
                  type="number"
                  min={20}
                  value={width ?? ''}
                  placeholder="auto"
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    updateAttributes({ width: Number.isFinite(n) && n > 0 ? n : null });
                  }}
                />
                px
                {shownH ? <span className="rte-img-h">× {shownH}</span> : null}
                <button type="button" onClick={() => updateAttributes({ width: null })} title="Full size">
                  auto
                </button>
              </span>
              <span className="rte-img-row rte-img-altrow">
                <span className="rte-img-altlabel">Alt</span>
                <input
                  className="rte-img-alt"
                  type="text"
                  value={(node.attrs.alt as string) ?? ''}
                  placeholder="mô tả ảnh cho SEO…"
                  onChange={(e) => updateAttributes({ alt: e.target.value })}
                />
              </span>
            </span>
            <span className="rte-img-handle" onMouseDown={onResizeStart} title="Drag to resize" />
          </>
        )}
      </span>
    </NodeViewWrapper>
  );
}
