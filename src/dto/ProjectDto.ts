import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class ProjectDto {
  @ApiProperty({ description: "Project ID" })
  @IsString()
  readonly projectId?: string

  @ApiProperty({ description: "Position ID" })
  @IsString()
  readonly positionId?: string
}
