import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

/**
 * Khoá chứa thông tin nhạy cảm — KHÔNG được ghi vào file log.
 * Sai mật khẩu khi đăng nhập cũng ném exception, nên nếu log nguyên body thì
 * mật khẩu dạng chữ thường nằm trong logs/error-*.log, ai đọc được file là đọc được.
 */
const SENSITIVE_KEYS =
  /^(password|currentPassword|newPassword|confirmPassword|oldPassword|token|accessToken|refreshToken|secret|otp|code|authorization|apiKey)$/i;

/** Thay giá trị của các khoá nhạy cảm bằng '[ĐÃ CHE]', giữ nguyên cấu trúc còn lại. */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEYS.test(key) ? '[ĐÃ CHE]' : redact(val, depth + 1);
  }
  return out;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    try {
      LoggerService.error('RAW EXCEPTION', {
        exception,
      });
    } catch (e) {
      console.error('Logger failed:', e);
    }

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: any = 'Internal server error';
    let error: any = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      message = (exceptionResponse as any).message || message;
      error = (exceptionResponse as any).error || null;
    } else if (exception?.message && process.env.NODE_ENV !== 'production') {
      // Lỗi ngoài HttpException (vd. lỗi TypeORM) mang theo tên bảng, tên cột,
      // đường dẫn file... Chỉ hiện khi chạy dev; production trả câu chung chung,
      // chi tiết đã nằm trong log phía dưới.
      message = exception.message;
    }

    try {
      LoggerService.error('HTTP Exception', {
        status,
        path: request.url,
        method: request.method,
        body: redact(request.body),
        query: redact(request.query),
        message,
        error,
        stack: exception?.stack,
      });
    } catch (e) {
      console.error('Logger failed:', e);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    });
  }
}
