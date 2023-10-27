import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class UpdatePositionDto {
  @ApiProperty({ description: "Position name", example: "NodeJs" })
  @IsNotEmpty()
  @IsString()
  readonly name: string
}
