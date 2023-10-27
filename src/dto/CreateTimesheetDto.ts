import { ApiProperty } from "@nestjs/swagger"
import { Types } from "mongoose"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateTimesheetDto {
  @ApiProperty({ example: "1632556800000" })
  @IsNotEmpty()
  @IsNumber()
  startTime: number

  @ApiProperty({ example: "1632616200000" })
  @IsNotEmpty()
  @IsNumber()
  endTime: number

  @ApiProperty({ example: "Some note", required: false })
  @IsString()
  @IsOptional()
  additionalNotes?: string
}
