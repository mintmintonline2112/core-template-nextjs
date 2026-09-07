import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    const userPermissions: string[] =
      user.permissions?.map((p: string) => p.toUpperCase()) || [];

    if (userPermissions.length === 0) return false;

    const handler = context.getHandler();
    const controller = context.getClass();

    const entity = this.reflector.getAllAndOverride<string>('entity', [
      handler,
      controller,
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [handler, controller],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const standardActions = [
        'LIST',
        'DETAIL',
        'CREATE',
        'UPDATE',
        'DELETE',
        'SORT',
      ];

      const finalRequiredCodes = requiredPermissions.map((p) => {
        const action = p.toUpperCase();
        if (standardActions.includes(action) && entity) {
          return `${entity.toUpperCase()}_${action}`;
        }
        return action;
      });

      return finalRequiredCodes.every((code) => userPermissions.includes(code));
    }

    if (entity) {
      const actionMap: Record<string, string> = {
        findAll: 'LIST',
        findOne: 'DETAIL',
        create: 'CREATE',
        update: 'UPDATE',
        remove: 'DELETE',
        updateSort: 'SORT',
      };

      const action = actionMap[handler.name];
      if (action) {
        const fallbackCode = `${entity.toUpperCase()}_${action}`;
        return userPermissions.includes(fallbackCode);
      }

      return true;
    }

    return false;
  }
}
