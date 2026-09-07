'use client';

import { Node, mergeAttributes, ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import { resolveImageUrl } from '@/admin/lib/utils';
import { embedUrl, isExternalVideo, videoProvider, type VideoOrientation } from '@/lib/video';

/**
 * Node "video" chèn giữa bài trong TipTap. HTML lưu ra:
 *   <figure data-video="file|youtube|vimeo" data-orientation="landscape|portrait"
 *           data-src="<link gốc>" class="rt-video is-landscape">
 *     <video src controls playsinline preload="metadata"> | <iframe src=embed>
 *   </figure>
 * Public sanitize giữ nguyên các thẻ/thuộc tính này để render đúng khung 16:9 / 9:16.
 */

export interface VideoAttrs {
  src: string;
  orientation?: VideoOrientation;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (attrs: VideoAttrs) => ReturnType;
    };
  }
}

export const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      orientation: { default: 'landscape' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-video]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const media = el.querySelector('video, iframe');
          const src = el.getAttribute('data-src') || media?.getAttribute('src') || '';
          if (!src) return false;
          return {
            src,
            orientation: el.getAttribute('data-orientation') === 'portrait' ? 'portrait' : 'landscape',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = String(HTMLAttributes.src ?? '');
    const orientation: VideoOrientation = HTMLAttributes.orientation === 'portrait' ? 'portrait' : 'landscape';
    const provider = videoProvider(src);
    const figureAttrs = mergeAttributes({
      'data-video': provider,
      'data-orientation': orientation,
      'data-src': src,
      class: `rt-video is-${orientation}`,
    });
    if (provider === 'file') {
      return ['figure', figureAttrs, ['video', { src, controls: 'true', playsinline: 'true', preload: 'metadata' }]];
    }
    const embed = embedUrl(src) ?? src;
    return [
      'figure',
      figureAttrs,
      [
        'iframe',
        {
          src: embed,
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { orientation: 'landscape', ...attrs } }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

function VideoNodeView({ node, updateAttributes, selected, editor, deleteNode }: NodeViewProps) {
  const src = String(node.attrs.src ?? '');
  const orientation: VideoOrientation = node.attrs.orientation === 'portrait' ? 'portrait' : 'landscape';
  const external = isExternalVideo(src);
  const embed = external ? embedUrl(src) : null;
  const fileSrc = external ? null : (resolveImageUrl(src) ?? src);

  return (
    <NodeViewWrapper className="rte-video-block" data-selected={selected ? 'true' : undefined}>
      <span className={`rte-video is-${orientation}`} contentEditable={false}>
        {external ? (
          embed ? (
            <iframe src={embed} title="video" allowFullScreen />
          ) : (
            <span className="rte-video-bad">Link không nhúng được: {src}</span>
          )
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={fileSrc ?? undefined} controls preload="metadata" />
        )}
      </span>
      {editor.isEditable && selected && (
        <span className="rte-video-tools" onMouseDown={(e) => e.stopPropagation()}>
          {(
            [
              ['landscape', 'Ngang 16:9'],
              ['portrait', 'Dọc 9:16'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={orientation === key ? 'is-active' : undefined}
              onClick={() => updateAttributes({ orientation: key })}
            >
              {label}
            </button>
          ))}
          <button type="button" className="is-danger" onClick={() => deleteNode()} title="Xóa video">
            <Trash2 size={12} /> Xóa
          </button>
        </span>
      )}
    </NodeViewWrapper>
  );
}
