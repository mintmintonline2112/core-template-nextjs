import { Transform } from 'class-transformer';

/**
 * Coerce multipart/string values ('1' | '0' | 'true' | 'false') into a real boolean
 * so @IsBoolean passes. Leaves undefined/null/'' untouched so DTO defaults still apply.
 */
export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true' || value === '1' || value === 1;
  });
}
