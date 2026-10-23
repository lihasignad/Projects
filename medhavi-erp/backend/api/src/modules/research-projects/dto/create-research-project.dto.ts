import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResearchProjectStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateResearchProjectDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({ description: 'Department UUID.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ description: 'PI faculty UUID.', format: 'uuid' })
  @IsUUID()
  principalInvestigatorFacultyId!: string;

  @ApiProperty({ description: 'Project title.' })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiPropertyOptional({ description: 'Abstract.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  abstract?: string;

  @ApiPropertyOptional({ description: 'Research domain.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  domain?: string;

  @ApiPropertyOptional({ description: 'Keywords.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Project status.', enum: ResearchProjectStatus })
  @IsOptional()
  @IsEnum(ResearchProjectStatus)
  status?: ResearchProjectStatus;

  @ApiPropertyOptional({ description: 'Start date.' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date.' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Budget amount.' })
  @IsOptional()
  @IsNumber()
  budgetAmount?: number;

  @ApiPropertyOptional({ description: 'Currency code.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Funding source.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fundingSource?: string;

  @ApiPropertyOptional({ description: 'Collaborators data.' })
  @IsOptional()
  @IsObject()
  collaboratorsJson?: Record<string, unknown>;

}
