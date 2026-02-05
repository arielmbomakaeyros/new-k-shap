import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../database/schemas/user.schema';
import { JwtPayload } from '../../../common/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
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

    for (const role of roles) {
      const perms = role?.permissions || [];
      for (const perm of perms) {
        if (typeof perm === 'string') {
          permissions.add(perm);
        } else if (perm?.code) {
          permissions.add(perm.code);
        }
      }
    }

    (user as any).permissions = Array.from(permissions);

    return user;
  }
}
