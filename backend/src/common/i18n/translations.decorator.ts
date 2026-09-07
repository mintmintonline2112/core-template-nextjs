import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { isValidTranslations } from './translations';

@ValidatorConstraint({ name: 'translations', async: false })
class TranslationsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidTranslations(value);
  }
  defaultMessage(): string {
    return 'translations phải có dạng { "vi": { ... } }';
  }
}

/**
 * Dùng chung cho các DTO có bản dịch. Nhận cả chuỗi JSON (khi form gửi
 * multipart/form-data kèm ảnh) lẫn object thường.
 */
export function IsTranslations() {
  return applyDecorators(
    ApiPropertyOptional({
      description: 'Bản dịch theo ngôn ngữ, ví dụ { "vi": { "title": "..." } }',
      type: 'object',
      additionalProperties: true,
    }),
    IsOptional(),
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      try {
        return JSON.parse(trimmed);
      } catch {
        return value; // để validator báo lỗi
      }
    }),
    Validate(TranslationsConstraint),
  );
}
