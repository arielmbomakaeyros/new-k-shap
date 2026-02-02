import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Additional data returned by the operation (optional)',
    example: { id: '123', name: 'example' },
    required: false,
  })
  data?: any;
}