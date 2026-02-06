import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../database/schemas/user.schema';
import { Department } from '../../../database/schemas/department.schema';
import { UserRole } from '../../../database/schemas/enums';
import { Role } from '../../../database/schemas/role.schema';
import { JwtPayload } from '../../../common/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Department.name) private departmentModel: Model<Department>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userModel
      .findById(payload.sub)
      .populate('company')
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .populate('departments')
      .populate('offices')
      .exec();

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const permissions = new Set<string>();
    const roles: any[] = (user.roles as any[]) || [];
    const derivedSystemRoles = new Set<string>((user.systemRoles as string[]) || []);

    for (const role of roles) {
      const perms = role?.permissions || [];
      for (const perm of perms) {
        if (typeof perm === 'string') {
          permissions.add(perm);
        } else if (perm?.code) {
          permissions.add(perm.code);
        }
      }
      if (role?.systemRoleType) {
        derivedSystemRoles.add(role.systemRoleType);
      }
    }

    if (!derivedSystemRoles.size && roles.length) {
      const roleIds = roles
        .map((role) => (typeof role === 'string' ? role : role?._id))
        .filter(Boolean);
      if (roleIds.length) {
        const roleDocs = await this.roleModel
          .find({ _id: { $in: roleIds } })
          .select('systemRoleType')
          .lean();
        roleDocs.forEach((roleDoc: any) => {
          if (roleDoc?.systemRoleType) {
            derivedSystemRoles.add(roleDoc.systemRoleType);
          }
        });
      }
    }

    (user as any).permissions = Array.from(permissions);
    (user as any).systemRoles = Array.from(derivedSystemRoles);

    // If department head has no departments assigned on the user, fall back
    // to departments where they are set as the head.
    if ((user as any).systemRoles?.includes(UserRole.DEPARTMENT_HEAD)) {
      const deptCount = (user.departments as any[])?.length || 0;
      if (!deptCount) {
        const companyId = (user.company as any)?._id || user.company;
        const filter: any = { head: user._id, isDeleted: false };
        if (companyId) {
          filter.company = companyId;
        }
        const departments = await this.departmentModel.find(filter).exec();
        (user as any).departments = departments;
      }
    }

    return user;
  }
}
