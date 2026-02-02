import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  ChangePasswordDto,
  SetPasswordDto,
  ResetPasswordRequestDto,
  ResetPasswordDto,
} from './dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in.',
    schema: {
      example: {
        user: {
          _id: '507f1f77bcf86cd799439011',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          isActive: true,
          isVerified: true,
          company: '507f1f77bcf86cd799439012'
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    console.log("login attempt in controller", dto);
    return this.authService.login(dto, req.ip || '');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out.',
    schema: {
      example: {
        success: true,
        message: 'Successfully logged out'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@CurrentUser('_id') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication tokens' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  async refresh(@Body() body: { refreshToken: string }, @CurrentUser('_id') userId: string) {
    return this.authService.refreshTokens(userId, body.refreshToken);
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set password for user' })
  @ApiBody({ type: SetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password set successfully.',
    schema: {
      example: {
        success: true,
        message: 'Password set successfully'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async changePassword(
    @CurrentUser('_id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ResetPasswordRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset request processed.',
    schema: {
      example: {
        success: true,
        message: 'Password reset link sent to your email'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async forgotPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
    schema: {
      example: {
        success: true,
        message: 'Password reset successfully'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: UserProfileDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@CurrentUser('_id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
