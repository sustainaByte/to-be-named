import { IsString, IsNumberString, IsObject, IsOptional } from "class-validator"

import { AddressDto } from "./AddressDto"
import { ApiProperty } from "@nestjs/swagger"
export class UpdateUserDto {
  @ApiProperty({ description: "User name", example: "Andrei" })
  @IsString()
  @IsOptional()
  readonly name?: string

  @ApiProperty({ description: "User surname", example: "Popescu" })
  @IsString()
  @IsOptional()
  readonly surname?: string

  @ApiProperty({ description: "User phone number", example: "0722222222" })
  @IsNumberString()
  @IsOptional()
  readonly phoneNumber?: number

  @ApiProperty({ description: "User address" })
  @IsObject()
  @IsOptional()
  readonly address?: AddressDto
}
