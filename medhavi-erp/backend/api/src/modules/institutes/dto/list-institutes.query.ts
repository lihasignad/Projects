import { ApiPropertyOptional } from '@nestjs/swagger';
import { InstituteStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListInstitutesQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  pageSize: number = 20;

  @ApiPropertyOptional({ description: 'Matches name, code, or domain (case-insensitive)' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: InstituteStatus })
  @IsOptional() @IsEnum(InstituteStatus)
  status?: InstituteStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  includeDeleted: boolean = false;
}
