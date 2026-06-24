import { ApiProperty } from '@nestjs/swagger';
import { InstituteStatus } from '@prisma/client';

export class InstituteDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false, nullable: true }) legalName!: string | null;
  @ApiProperty({ required: false, nullable: true }) domain!: string | null;
  @ApiProperty({ required: false, nullable: true }) logoFileId!: string | null;
  @ApiProperty() timezone!: string;
  @ApiProperty() locale!: string;
  @ApiProperty({ enum: InstituteStatus }) status!: InstituteStatus;
  @ApiProperty({ required: false, nullable: true }) contactEmail!: string | null;
  @ApiProperty({ required: false, nullable: true }) contactPhone!: string | null;
  @ApiProperty({ required: false, nullable: true }) addressLine1!: string | null;
  @ApiProperty({ required: false, nullable: true }) addressLine2!: string | null;
  @ApiProperty({ required: false, nullable: true }) city!: string | null;
  @ApiProperty({ required: false, nullable: true }) state!: string | null;
  @ApiProperty({ required: false, nullable: true }) country!: string | null;
  @ApiProperty({ required: false, nullable: true }) postalCode!: string | null;
  @ApiProperty({ required: false, nullable: true, type: Object }) metadata!: unknown;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ required: false, nullable: true }) deletedAt!: Date | null;
}

export class PaginatedInstitutesDto {
  @ApiProperty({ type: [InstituteDto] }) data!: InstituteDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}
