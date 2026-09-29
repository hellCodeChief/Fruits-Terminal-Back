import { IsOptional, IsString, IsNumber, IsBooleanString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Category IDs (comma-separated)',
    example: '1,2,3',
  })
  @IsOptional()
  @IsString()
  byCategory?: string;

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: '100',
  })
  @IsOptional()
  @IsString()
  gte?: string;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: '500',
  })
  @IsOptional()
  @IsString()
  lte?: string;

  @ApiPropertyOptional({
    description: 'Availability status',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  available?: string;

  @ApiPropertyOptional({
    description: 'Sorting option',
    example: 'asc | desc | cheap | expensive | mostly-visited',
  })
  @IsOptional()
  @IsIn(['asc', 'desc', 'cheap', 'expensive', 'mostly-visited'])
  sort?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page_size?: number;
}
