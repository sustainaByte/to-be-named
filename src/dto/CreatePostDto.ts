import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class CreatePostDto {
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
}
