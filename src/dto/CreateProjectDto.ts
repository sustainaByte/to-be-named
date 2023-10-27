import { ApiProperty } from "@nestjs/swagger"
import { Types } from "mongoose"
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator"

import { ProjectStatus } from "src/@types"

export class CreateProjectDto {
  @ApiProperty({ example: "Internship" })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ example: "Alias" })
  @IsString()
  alias: string

  @ApiProperty({ example: "Project description" })
  @IsString()
  description: string

  @ApiProperty({ example: "64f43...a891" })
  @IsNotEmpty()
  @IsMongoId()
  departmentId: Types.ObjectId

  @ApiProperty({ example: ["64f439d8...d1198fa891"] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  positions: Types.ObjectId[]

  @ApiProperty({ example: "64f43...a891" })
  @IsOptional()
  @IsMongoId({ each: true })
  projectLead: Types.ObjectId

  @ApiProperty({ example: "closed, in_maintenance, in_stand_by" })
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: string

  @ApiProperty({ example: "https://jira.com" })
  @IsString()
  board: string
}
