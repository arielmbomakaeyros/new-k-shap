import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'reset-token-received-via-email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'newSecurePassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'newSecurePassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}