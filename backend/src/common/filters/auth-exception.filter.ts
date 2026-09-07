import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 401 trên nhóm route auth. Chỉ xóa cookie phiên khi CHÍNH refresh thất bại
 * (refresh token hết hạn/thu hồi) — lúc đó phiên thật sự chết. Các 401 khác
 * (điển hình: access token hết hạn khi gọi /me) phải GIỮ refreshToken để
 * frontend gọi /refresh gia hạn — xóa ở đây là tự đá người dùng ra sau mỗi
 * chu kỳ access token dù refresh token còn hạn 7 ngày.
 */
@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (request.path.endsWith('/refresh')) {
      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Unauthorized',
    });
  }
}
