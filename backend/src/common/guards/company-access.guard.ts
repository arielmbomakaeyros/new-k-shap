import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (!user) {
      return false;
    }

    // Kaeyros users can access ALL companies (for support)
    if (user.isKaeyrosUser) {
      // Log the access for audit purposes
      request.isKaeyrosAccess = true;
      return true;
    }

    // Company users can ONLY access their own company
    if (params.companyId && user.company) {
      if (params.companyId !== (user.company._id || user.company).toString()) {
        throw new ForbiddenException(
          'You do not have access to this company data',
        );
      }
    }

    // For requests that include company-scoped resources
    // The service layer should also verify company ownership

    return true;
  }
}
