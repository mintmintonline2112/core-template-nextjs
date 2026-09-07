import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAdmin } from 'src/modules/admin/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtAdmin => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
