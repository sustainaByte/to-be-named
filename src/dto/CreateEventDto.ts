import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator"

export class CreateEventDto {
  @ApiProperty({ description: "Title" })
  @IsString()
  readonly title: string

  @ApiProperty({ description: "Content" })
  @IsString()
  readonly content: string

  @ApiProperty({ description: "Media URL", required: false })
  @IsString({ each: true })
  @IsOptional()
  readonly mediaUrl?: string[]

  @ApiProperty({ description: "Required Money", required: false })
  @IsOptional()
  @IsNumber()
  readonly requiredMoney?: number

  @ApiProperty({ description: "Collected Money", required: false })
  @IsOptional()
  @IsNumber()
  readonly collectedMoney?: number

  @ApiProperty({ description: "Volunteers", required: false })
  @IsOptional()
  @IsString({ each: true })
  readonly volunteers?: string[]

  @ApiProperty({ description: "Donors", required: false })
  @IsOptional()
  @IsObject({ each: true })
  readonly donors?: { userId: string; amount: number }[]
}
