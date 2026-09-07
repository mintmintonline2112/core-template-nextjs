import type { ReactNode } from 'react';
import type { RegisterOptions } from 'react-hook-form';

export type GenericFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'image'
  | 'imageUrl'
  | 'video'
  | 'date'
  | 'tel'
  | 'tags';

export interface GenericSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface GenericFormGroup {
  id: string;
  title: string;
  description?: string;
  collapsed?: boolean;
}

export interface GenericFormField {
  key: string;
  label: string;
  type: GenericFieldType;

  /** id của GenericFormGroup — field có group được render trong khối gập/mở riêng */
  group?: string;

  placeholder?: string;
  hint?: string;
  autocomplete?: string;

  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;

  options?: GenericSelectOption[];

  /** type 'video': key của field lưu hướng video (landscape|portrait) — mặc định `${key}Orientation` */
  orientationKey?: string;

  showPasswordToggle?: boolean;

  rules?: RegisterOptions;
  minLength?: number;

  className?: string;

  /**
   * Render khối phụ ngay dưới field (sau hint/error), nhận toàn bộ giá trị
   * hiện tại của form — dùng cho các khối xem trước phụ thuộc nhiều field
   * (vd. xem trước phân khu gallery phụ thuộc content + displayType).
   */
  renderExtra?: (values: Record<string, unknown>) => ReactNode;
}
