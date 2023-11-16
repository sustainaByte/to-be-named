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
  @IsString()
  @IsOptional()
  readonly mediaUrl?: string[]
}
