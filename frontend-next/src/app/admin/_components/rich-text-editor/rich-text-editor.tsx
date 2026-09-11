'use client';

import './rich-text-editor.css';
import { useEffect, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  Image as ImageIcon,
  Minus,
  MousePointerClick,
  Undo2,
  Redo2,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { LibraryPicker } from '@/app/admin/_components/library-picker/library-picker';
import { VideoInput, type VideoOrientation } from '@/app/admin/_components/generic-form/video-input';
import { resolveImageUrl } from '@/app/admin/_lib/utils';
import { isExternalVideo } from '@/lib/video';
import { ResizableImage } from './resizable-image';
import { VideoNode } from './video-node';

const LinkWithClass = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (el) => el.getAttribute('class'),
        renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
      },
    };
  },
});

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: Props) {
  const [libOpen, setLibOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [buttonOpen, setButtonOpen] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit,
      Underline,
      LinkWithClass.configure({ openOnClick: false, autolink: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      ResizableImage.configure({ inline: false }),
      VideoNode,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Nhập nội dung…' }),
    ],
    content: value || '',
    editorProps: { attributes: { class: 'rte-content' } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '';
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return <div className="rte"><div className="rte-content" style={{ color: '#9ca3af' }}>Đang tải trình soạn thảo…</div></div>;
  }

  return (
    <div className={`rte${disabled ? ' is-disabled' : ''}`}>
      <Toolbar
        editor={editor}
        disabled={disabled}
        onPickImage={() => setLibOpen(true)}
        onPickVideo={() => setVideoOpen(true)}
        onLink={() => setLinkOpen(true)}
        onButton={() => setButtonOpen(true)}
      />
      <EditorContent editor={editor} />
      <LibraryPicker
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
      />
      {videoOpen && (
        <VideoInsertDialog
          onClose={() => setVideoOpen(false)}
          onInsert={(src, orientation) => {
            editor.chain().focus().setVideo({ src, orientation }).run();
            setVideoOpen(false);
          }}
        />
      )}
      {linkOpen && (
        <PromptDialog
          title={editor.isActive('link') ? 'Sửa link' : 'Chèn link'}
          fields={[
            {
              key: 'href',
              label: 'Địa chỉ link',
              placeholder: 'https://…',
              initial: (editor.getAttributes('link').href as string | undefined) ?? 'https://',
            },
          ]}
          submitLabel="Áp dụng"
          secondary={
            editor.isActive('link')
              ? {
                  label: 'Gỡ link',
                  onClick: () => {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    setLinkOpen(false);
                  },
                }
              : undefined
          }
          onClose={() => setLinkOpen(false)}
          onSubmit={({ href }) => {
            const url = href.trim();
            if (!url || url === 'https://') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
            } else {
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
            setLinkOpen(false);
          }}
        />
      )}
      {buttonOpen && (
        <PromptDialog
          title="Chèn nút bấm"
          fields={[
            { key: 'label', label: 'Chữ trên nút', placeholder: 'Đặt lịch ngay', initial: 'Đặt lịch ngay' },
            { key: 'href', label: 'Link của nút', placeholder: 'https://… hoặc /contact', initial: '' },
          ]}
          submitLabel="Chèn nút"
          onClose={() => setButtonOpen(false)}
          onSubmit={({ label, href }) => {
            const text = label.trim();
            const url = href.trim();
            if (!text || !url) return;
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'paragraph',
                content: [{ type: 'text', text, marks: [{ type: 'link', attrs: { href: url, class: 'btn' } }] }],
              })
              .run();
            setButtonOpen(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Hộp nhập nhỏ thay cho window.prompt (trình duyệt nhúng/webview không hỗ trợ prompt).
 * Enter = xác nhận, Esc = đóng; ô đầu tiên tự focus. KHÔNG dùng <form>: editor đã
 * nằm trong form của trang, form lồng nhau bị trình duyệt bỏ → nút submit sẽ lưu cả bài.
 */
function PromptDialog({
  title,
  fields,
  submitLabel,
  secondary,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: { key: string; label: string; placeholder?: string; initial?: string }[];
  submitLabel: string;
  secondary?: { label: string; onClick: () => void };
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.initial ?? ''])),
  );
  const canSubmit = fields.every((f) => values[f.key]?.trim());

  return (
    <div className="lib-overlay" onMouseDown={onClose}>
      <div className="lib-modal rte-prompt-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="lib-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div
          className="rte-video-dialog-body rte-prompt-body"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              if (canSubmit) onSubmit(values);
            }
          }}
        >
          {fields.map((f, i) => (
            <label key={f.key} className="rte-prompt-field">
              <span>{f.label}</span>
              <input
                className="gf-control"
                value={values[f.key] ?? ''}
                placeholder={f.placeholder}
                autoFocus={i === 0}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </label>
          ))}
          <div className="rte-video-dialog-foot rte-prompt-foot">
            {secondary && (
              <button type="button" className="adm-btn rte-prompt-secondary" onClick={secondary.onClick}>
                {secondary.label}
              </button>
            )}
            <button type="button" className="adm-btn" onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--primary rte-prompt-submit"
              disabled={!canSubmit}
              onClick={() => onSubmit(values)}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hộp chèn video vào giữa bài: tải file (có tiến trình) hoặc dán link, chọn ngang/dọc. */
function VideoInsertDialog({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (src: string, orientation: VideoOrientation) => void;
}) {
  const [src, setSrc] = useState('');
  const [orientation, setOrientation] = useState<VideoOrientation | ''>('');

  return (
    <div className="lib-overlay" onMouseDown={onClose}>
      <div className="lib-modal rte-video-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="lib-head">
          <h3>Chèn video vào bài</h3>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="rte-video-dialog-body">
          <VideoInput
            value={src}
            orientation={orientation}
            onChange={(path, o) => {
              setSrc(path);
              setOrientation(o);
            }}
          />
          <p className="gf-hint">
            Video chèn tại vị trí con trỏ. Tải MP4/WebM/MOV tới 200MB hoặc dán link YouTube/Vimeo; chọn Ngang 16:9 hay Dọc 9:16.
          </p>
        </div>
        <div className="rte-video-dialog-foot">
          <button type="button" className="adm-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            disabled={!src.trim()}
            onClick={() => {
              // file upload trả path tương đối (uploads/videos/…) → lưu URL tuyệt đối như ảnh chèn từ Thư viện,
              // không thì <video> trong trang admin/public tìm sai chỗ
              const value = src.trim();
              const absolute = isExternalVideo(value) ? value : (resolveImageUrl(value) ?? value);
              onInsert(absolute, orientation || 'landscape');
            }}
          >
            Chèn video
          </button>
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  editor,
  disabled,
  onPickImage,
  onPickVideo,
  onLink,
  onButton,
}: {
  editor: Editor;
  disabled?: boolean;
  onPickImage: () => void;
  onPickVideo: () => void;
  onLink: () => void;
  onButton: () => void;
}) {
  const Btn = ({
    onClick,
    active,
    disabled: d,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={active ? 'is-active' : undefined}
      disabled={disabled || d}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="rte-toolbar">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></Btn>

      <span className="rte-divider" />

      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote size={15} /></Btn>

      <span className="rte-divider" />

      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center"><AlignCenter size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight size={15} /></Btn>

      <span className="rte-divider" />

      <Btn onClick={onLink} active={editor.isActive('link')} title="Link"><Link2 size={15} /></Btn>
      {editor.isActive('link') && (
        <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link"><Unlink size={15} /></Btn>
      )}
      <Btn onClick={onPickImage} title="Chèn ảnh từ Thư viện"><ImageIcon size={15} /></Btn>
      <Btn onClick={onPickVideo} title="Chèn video (tải lên hoặc YouTube/Vimeo)"><VideoIcon size={15} /></Btn>
      <Btn onClick={onButton} title="Chèn nút bấm"><MousePointerClick size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={15} /></Btn>

      <span className="rte-divider" />

      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo2 size={15} /></Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo2 size={15} /></Btn>
    </div>
  );
}
