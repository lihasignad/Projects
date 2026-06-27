import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, UserStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * CreateUserDto
 *
 * Identity-only payload. Authentication artefacts (password, MFA,
 * credentials, sessions, tokens) are explicitly out of scope and remain
 * owned by AuthModule.
 *
 * System-managed fields intentionally excluded:
 *   createdAt, updatedAt, deletedAt,
 *   failedLoginCount, lastLoginAt, lastLoginIp,
 *   emailVerifiedAt, phoneVerifiedAt,
 *   lockedUntil, mfaEnabled, mustChangePassword.
 */
export class CreateUserDto {
  @ApiPropertyOptional({
    description:
      'Parent institute UUID. Omit (null) for platform-level users such as Super Admin.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @ApiProperty({
    description: 'Globally unique email address.',
    maxLength: 254,
    example: 'jane.doe@medhavi.local',
  })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({
    description: 'Globally unique phone number in E.164 format.',
    example: '+919876543210',
    maxLength: 20,
  })
  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ minLength: 1, maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  middleName?: string;

  @ApiProperty({ minLength: 1, maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Override of the rendered display name.',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  displayName?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'ISO-8601 date of birth (date only, no time component).',
    example: '2001-05-12',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'UUID of a FileObject representing the avatar image.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  avatarFileId?: string;

  @ApiPropertyOptional({
    description: 'BCP-47 language tag.',
    default: 'en',
    maxLength: 16,
  })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'IANA timezone (e.g. Asia/Kolkata).',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Free-form metadata bag.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
