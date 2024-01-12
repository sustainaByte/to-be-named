import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"
import { FileUploadDto } from '../dto/FileUploadDto'

export class CreatePostDto {
  @ApiProperty({ description: "Title" })
  @IsString()
  readonly title: string

  @ApiProperty({ description: "Content" })
  @IsString()
  readonly content: string

    @ApiProperty({ description: "Media file", })
    @IsOptional()
    mediaUrl?: string[];
}
