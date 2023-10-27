import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreatePositionDto {
  @ApiProperty({ description: "Position name", example: "Frontend Dev" })
  @IsNotEmpty()
  @IsString()
  readonly name: string
}
