import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password (required for authenticated password change)',
    example: 'OldPassword123!',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewSecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match newPassword)',
    example: 'NewSecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}

export class ResetPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
