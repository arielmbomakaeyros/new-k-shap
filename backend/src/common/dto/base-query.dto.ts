import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class BaseQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order (asc/desc)',
    enum: SortOrder,
    example: SortOrder.DESC,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({
    description: 'Search term to filter results',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}