import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../../database/schemas/user.schema';
import { Company } from '../../database/schemas/company.schema';
import { EmailService } from '../../email/email.service';
import { JwtPayload } from '../../common/interfaces';
import { getEmailSubject } from '../../common/i18n/email';
import { resolveLanguage } from '../../common/i18n/language';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  ChangePasswordDto,
  SetPasswordDto,
  ResetPasswordRequestDto,
  ResetPasswordDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async login(dto: LoginDto, ipAddress: string) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase(), isDeleted: false })
      .populate('company')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.canLogin) {
      throw new UnauthorizedException(
        'Account is not activated. Please set your password first.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check company status for non-Kaeyros users
    if (!user.isKaeyrosUser && user.company) {
      const company = user.company as any;
      if (company.status === 'suspended') {
        throw new UnauthorizedException('Company account is suspended');
      }
      if (company.status === 'expired') {
        throw new UnauthorizedException('Company subscription has expired');
      }
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update user login info
    user.lastLogin = new Date();
    user.lastLoginIp = ipAddress;
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { success: true, message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .populate('company')
      .exec();

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.canLogin) {
      throw new UnauthorizedException(
        'Account is not activated. Please set your password first.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check company status for non-Kaeyros users
    if (!user.isKaeyrosUser && user.company) {
      const company = user.company as any;
      if (company.status === 'suspended') {
        throw new UnauthorizedException('Company account is suspended');
      }
      if (company.status === 'expired') {
        throw new UnauthorizedException('Company subscription has expired');
      }
    }

    const tokens = await this.generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async setPassword(dto: SetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findOne({
      activationToken: dto.token,
      activationTokenExpiry: { $gt: new Date() },
      isDeleted: false,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired activation token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    user.password = hashedPassword;
    user.canLogin = true;
    user.mustChangePassword = false;
    user.activationToken = undefined as any;
    user.activationTokenExpiry = undefined as any;
    await user.save();

    return { success: true, message: 'Password set successfully. You can now login.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // If user already has a password, verify current password
    if (user.canLogin && dto.currentPassword) {
      const isCurrentValid = await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );
      if (!isCurrentValid) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    user.password = hashedPassword;
    user.mustChangePassword = false;
    await user.save();

    return { success: true, message: 'Password changed successfully' };
  }

  async requestPasswordReset(dto: ResetPasswordRequestDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
      isDeleted: false,
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1);

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetExpiry;
    await user.save();

    // Send email
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;
    const company = user.company ? await this.companyModel.findById(user.company) : null;
    const language = resolveLanguage({ user, company });
    await this.emailService.send({
      to: user.email,
      subject: getEmailSubject('password-reset', language),
      template: 'password-reset',
      language,
      context: {
        firstName: user.firstName,
        resetUrl,
      },
    });

    return {
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findOne({
      passwordResetToken: dto.token,
      passwordResetExpiry: { $gt: new Date() },
      isDeleted: false,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    user.password = hashedPassword;
    user.passwordResetToken = undefined as any;
    user.passwordResetExpiry = undefined as any;
    user.canLogin = true;
    await user.save();

    return { success: true, message: 'Password reset successfully. You can now login.' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('company')
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .populate('departments')
      .populate('offices')
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found');
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.preferredLanguage !== undefined) user.preferredLanguage = dto.preferredLanguage;
    if (dto.notificationPreferences !== undefined) {
      user.notificationPreferences = {
        ...(user.notificationPreferences || {}),
        ...dto.notificationPreferences,
      };
    }

    await user.save();

    return this.sanitizeUser(user);
  }

  async updateProfileAvatar(userId: string, file: Express.Multer.File, updaterUser: any) {
    const updated = await this.usersService.updateAvatar(userId, file, updaterUser);
    return this.sanitizeUser(updated);
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      company: user.company ? ((user.company as any)._id || user.company).toString() : undefined,
      isKaeyrosUser: user.isKaeyrosUser,
      systemRoles: user.systemRoles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    };
  }

  private sanitizeUser(user: User) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.activationToken;
    delete userObj.activationTokenExpiry;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpiry;
    return userObj;
  }
}
