// ==================== src/common/decorators/current-user.decorator.ts ====================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// ==================== src/common/decorators/current-company.decorator.ts ====================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentCompany = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.company;
  },
);

// ==================== src/common/decorators/public.decorator.ts ====================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ==================== src/common/decorators/permissions.decorator.ts ====================

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// ==================== src/common/decorators/kaeyros-only.decorator.ts ====================

import { SetMetadata } from '@nestjs/common';

export const KAEYROS_ONLY_KEY = 'kaeyrosOnly';
export const KaeyrosOnly = () => SetMetadata(KAEYROS_ONLY_KEY, true);

// ==================== src/common/guards/jwt-auth.guard.ts ====================

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}

// ==================== src/common/guards/permissions.guard.ts ====================

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '@/database/schemas/permission.schema';
import { Role } from '@/database/schemas/role.schema';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Kaeyros users have all permissions
    if (user.isKaeyrosUser) {
      return true;
    }

    // Company super admin has all permissions within their company
    if (user.systemRoles?.includes('company_super_admin')) {
      return true;
    }

    // Get user's roles with populated permissions
    const userRoles = await this.roleModel
      .find({ _id: { $in: user.roles } })
      .populate('permissions');

    // Collect all permission codes
    const userPermissionCodes = new Set<string>();
    
    userRoles.forEach(role => {
      role.permissions.forEach((permission: any) => {
        userPermissionCodes.add(permission.code);
      });
    });

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(required =>
      userPermissionCodes.has(required),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

// ==================== src/common/guards/kaeyros.guard.ts ====================

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KAEYROS_ONLY_KEY } from '../decorators/kaeyros-only.decorator';

@Injectable()
export class KaeyrosGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const kaeyrosOnly = this.reflector.getAllAndOverride<boolean>(KAEYROS_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!kaeyrosOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isKaeyrosUser) {
      throw new ForbiddenException('This action is restricted to Kaeyros administrators');
    }

    return true;
  }
}

// ==================== src/common/guards/company-access.guard.ts ====================
// Ensures multi-tenant data isolation

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Kaeyros users can access all companies
    if (user.isKaeyrosUser) {
      return true;
    }

    // If route has companyId param, verify user belongs to that company
    if (params.companyId && user.company) {
      if (params.companyId !== user.company.toString()) {
        throw new ForbiddenException('You do not have access to this company data');
      }
    }

    return true;
  }
}

// ==================== src/common/guards/disbursement-workflow.guard.ts ====================
// Special guard for disbursement workflow validation

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Disbursement } from '@/database/schemas/disbursement.schema';

@Injectable()
export class DisbursementWorkflowGuard implements CanActivate {
  constructor(
    @InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const disbursementId = request.params.id;
    const action = this.getActionFromRoute(request.route.path);

    // Kaeyros users and company super admins can bypass workflow
    if (user.isKaeyrosUser || user.systemRoles?.includes('company_super_admin')) {
      return true;
    }

    const disbursement = await this.disbursementModel
      .findById(disbursementId)
      .populate('department');

    if (!disbursement) {
      throw new ForbiddenException('Disbursement not found');
    }

    // Check if user belongs to same company
    if (disbursement.company.toString() !== user.company.toString()) {
      throw new ForbiddenException('Access denied');
    }

    switch (action) {
      case 'validate':
        return this.canValidate(user, disbursement);
      case 'approve':
        return this.canApprove(user, disbursement);
      case 'execute':
        return this.canExecute(user, disbursement);
      default:
        return true;
    }
  }

  private canValidate(user: any, disbursement: any): boolean {
    // Must be department head or validator
    const canValidate =
      user.systemRoles?.includes('department_head') ||
      user.systemRoles?.includes('validator');

    if (!canValidate) {
      throw new ForbiddenException('Only department heads can validate disbursements');
    }

    // Must be head of the disbursement's department
    if (!user.departments?.some((dept: any) => 
      dept.toString() === disbursement.department._id.toString()
    )) {
      throw new ForbiddenException('You can only validate disbursements from your department');
    }

    // Check disbursement status
    if (disbursement.status !== 'pending_dept_head') {
      throw new ForbiddenException('Disbursement is not pending validation');
    }

    return true;
  }

  private canApprove(user: any, disbursement: any): boolean {
    // Must be a validator
    if (!user.systemRoles?.includes('validator')) {
      throw new ForbiddenException('Only validators can approve disbursements');
    }

    // Check approval amount limit
    if (user.maxApprovalAmount && disbursement.amount > user.maxApprovalAmount) {
      throw new ForbiddenException(
        `Disbursement amount exceeds your approval limit of ${user.maxApprovalAmount}`,
      );
    }

    // Check disbursement status
    if (disbursement.status !== 'pending_validator') {
      throw new ForbiddenException('Disbursement is not pending approval');
    }

    return true;
  }

  private canExecute(user: any, disbursement: any): boolean {
    // Must be a cashier
    if (!user.systemRoles?.includes('cashier')) {
      throw new ForbiddenException('Only cashiers can execute disbursements');
    }

    // Check disbursement status
    if (disbursement.status !== 'pending_cashier') {
      throw new ForbiddenException('Disbursement is not ready for execution');
    }

    return true;
  }

  private getActionFromRoute(path: string): string {
    if (path.includes('validate')) return 'validate';
    if (path.includes('approve')) return 'approve';
    if (path.includes('execute')) return 'execute';
    return 'unknown';
  }
}

// ==================== src/common/pipes/validation.pipe.ts ====================

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const formattedErrors = errors.map(error => ({
        field: error.property,
        message: Object.values(error.constraints || {})[0],
        value: error.value,
      }));

      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

// ==================== src/common/dto/pagination.dto.ts ====================

import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;
}

// Helper to build pagination response
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}