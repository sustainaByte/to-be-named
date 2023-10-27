import { ApiProperty } from "@nestjs/swagger"
import {
  IsEmail,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator"
import { EmploymentType } from "src/@types"
import { AddressDto } from "./AddressDto"
import { ProjectDto } from "./ProjectDto"

export class UpdateEmployeeDto {
  @ApiProperty({ description: "User email" })
  @IsOptional()
  @IsEmail()
  readonly email?: string

  @ApiProperty({ description: "User name" })
  @IsOptional()
  @IsString()
  readonly name?: string

  @ApiProperty({ description: "User surname" })
  @IsOptional()
  @IsString()
  readonly surname?: string

  @ApiProperty({ description: "User phone number" })
  @IsOptional()
  @IsNumberString()
  readonly phoneNumber?: string

  @ApiProperty({ description: "User emergency number" })
  @IsOptional()
  @IsNumberString()
  readonly emergencyNumber?: string

  @IsOptional()
  @IsEnum(EmploymentType)
  readonly employmentType?: number

  @ApiProperty({
    description: "User address",
    type: () => AddressDto,
  })
  @IsOptional()
  readonly address?: AddressDto

  @ApiProperty({
    description: "Projects",
    type: () => ProjectDto,
    isArray: true,
  })
  @IsOptional()
  projects?: ProjectDto[]
}
