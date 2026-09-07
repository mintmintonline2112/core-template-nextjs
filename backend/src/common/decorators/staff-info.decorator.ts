import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountType } from 'src/common/enums/account-type.enum';

export interface IStaffInfo {
  staffId: string;
  isPrivileged: boolean;
}

export const StaffInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const staff = request.user;

    if (!staff) return { isPrivileged: false };
    const isPrivileged = [AccountType.ADMIN, AccountType.STAFF].includes(
      staff.type,
    );

    return {
      staffId: staff.id,
      type: staff.type,
      isPrivileged: isPrivileged,
    };
  },
);
