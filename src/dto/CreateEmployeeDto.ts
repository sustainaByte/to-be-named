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

export class CreateEmployeeDto {
  @ApiProperty({ description: "User email" })
  @IsEmail()
  readonly email: string

  @ApiProperty({ description: "User name" })
  @IsString()
  readonly name: string

  @ApiProperty({ description: "User surname" })
  @IsString()
  readonly surname: string

  @ApiProperty({ description: "User phone number" })
  @IsNumberString()
  readonly phoneNumber: string

  @ApiProperty({ description: "User emergency number" })
  @IsNumberString()
  readonly emergencyNumber: string

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType: number

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
  readonly projects?: ProjectDto[]
}
