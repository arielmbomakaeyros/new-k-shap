// ==================== src/modules/auth/dto/login.dto.ts ====================

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ActivateAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

// ==================== src/modules/auth/auth.service.ts ====================

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '@/database/schemas/user.schema';
import { Company } from '@/database/schemas/company.schema';
import { EmailService } from '@/email/email.service';
import { AuditLogService } from '@/modules/audit-logs/audit-logs.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/common/constants/error-messages';
import { LoginDto, ActivateAccountDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
  ) {}

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .populate('roles')
      .populate('company');

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS);
    }

    // Check if user can login
    if (!user.canLogin) {
      throw new ForbiddenException(ERROR_MESSAGES.USER_CANNOT_LOGIN);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenException(ERROR_MESSAGES.USER_INACTIVE);
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS);
    }

    // Check company status (if user belongs to a company)
    if (user.company) {
      const company = await this.companyModel.findById(user.company);
      
      if (!company || company.isDeleted) {
        throw new ForbiddenException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
      }

      if (company.status === 'suspended') {
        throw new ForbiddenException(ERROR_MESSAGES.COMPANY_SUSPENDED);
      }

      if (company.status === 'expired') {
        throw new ForbiddenException(ERROR_MESSAGES.COMPANY_EXPIRED);
      }
    }

    // Check if user must change password
    if (user.mustChangePassword) {
      return {
        success: false,
        message: ERROR_MESSAGES.AUTH_MUST_CHANGE_PASSWORD,
        requiresPasswordChange: true,
        userId: user._id,
      };
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = ipAddress;
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();

    // Log the login
    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'LOGIN',
      actionDescription: `User ${user.email} logged in`,
      resourceType: 'user',
      resourceId: user._id,
      ipAddress,
      userAgent,
      severity: 'info',
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
    };
  }

  async logout(userId: string, ipAddress: string, userAgent: string) {
    const user = await this.userModel.findById(userId);
    
    if (user) {
      user.refreshToken = null;
      await user.save();

      await this.auditLogService.log({
        user: user._id,
        company: user.company,
        action: 'LOGOUT',
        actionDescription: `User ${user.email} logged out`,
        resourceType: 'user',
        resourceId: user._id,
        ipAddress,
        userAgent,
        severity: 'info',
      });
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH_TOKEN_INVALID);
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH_TOKEN_INVALID);
    }

    const tokens = await this.generateTokens(user);
    
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();

    return {
      success: true,
      data: tokens,
    };
  }

  async activateAccount(activateDto: ActivateAccountDto, ipAddress: string, userAgent: string) {
    const { token, newPassword } = activateDto;

    const user = await this.userModel.findOne({
      activationToken: token,
      activationTokenExpiry: { $gt: new Date() },
      isDeleted: false,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired activation token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user - CRITICAL: canLogin can ONLY be set here, NEVER changed again
    user.password = hashedPassword;
    user.canLogin = true; // This is permanent and can never be changed
    user.mustChangePassword = false;
    user.activationToken = null;
    user.activationTokenExpiry = null;
    await user.save();

    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'PASSWORD_CHANGE',
      actionDescription: 'User activated account and set initial password',
      resourceType: 'user',
      resourceId: user._id,
      ipAddress,
      userAgent,
      severity: 'info',
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.ACCOUNT_ACTIVATED,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ 
      email: email.toLowerCase(),
      isDeleted: false,
    });

    // Don't reveal if user exists or not
    if (!user) {
      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.passwordResetToken = await bcrypt.hash(resetToken, 10);
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Send email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, ipAddress: string, userAgent: string) {
    const { token, newPassword } = resetPasswordDto;

    const users = await this.userModel.find({
      passwordResetExpiry: { $gt: new Date() },
      isDeleted: false,
    });

    let user = null;
    for (const u of users) {
      if (u.passwordResetToken && await bcrypt.compare(token, u.passwordResetToken)) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'PASSWORD_RESET',
      actionDescription: 'User reset password',
      resourceType: 'user',
      resourceId: user._id,
      ipAddress,
      userAgent,
      severity: 'info',
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'PASSWORD_CHANGE',
      actionDescription: 'User changed password',
      resourceType: 'user',
      resourceId: user._id,
      ipAddress,
      userAgent,
      severity: 'info',
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
    };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      company: user.company,
      isKaeyrosUser: user.isKaeyrosUser,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, activationToken, passwordResetToken, ...sanitized } = user.toObject();
    return sanitized;
  }
}

// ==================== src/modules/auth/strategies/jwt.strategy.ts ====================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.userModel
      .findById(payload.sub)
      .populate('roles')
      .populate('company');

    if (!user || user.isDeleted || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}

// ==================== src/modules/auth/auth.controller.ts ====================

import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import {
  LoginDto,
  ActivateAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    return this.authService.login(loginDto, req.ip, req.headers['user-agent']);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any, @Req() req: any) {
    return this.authService.logout(user._id, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('activate')
  async activateAccount(@Body() activateDto: ActivateAccountDto, @Req() req: any) {
    return this.authService.activateAccount(activateDto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: any) {
    return this.authService.resetPassword(resetPasswordDto, req.ip, req.headers['user-agent']);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    return this.authService.changePassword(user._id, changePasswordDto, req.ip, req.headers['user-agent']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      data: user,
    };
  }
}