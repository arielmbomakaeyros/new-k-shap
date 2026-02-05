import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Name of the department',
    example: 'Information Technology',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the department',
    example: 'Handles all IT infrastructure and development',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Company ID associated with the department',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({
    description: 'User ID of the department head',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsString()
  @IsOptional()
  headId?: string;
}
