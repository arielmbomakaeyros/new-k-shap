import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { runWithTenantContext } from '../tenancy/tenant-context';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request?.user;

    const store = {
      companyId: user?.company
        ? (user.company._id || user.company).toString()
        : null,
      isKaeyrosUser: !!user?.isKaeyrosUser,
      userId: user?._id ? user._id.toString() : null,
    };

    return runWithTenantContext(store, () => next.handle());
  }
}
