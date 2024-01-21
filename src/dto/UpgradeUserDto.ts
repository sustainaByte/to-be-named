/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class UpgradeUserDto {
  @ApiProperty({ description: "Role name" })
  @IsString()
  readonly role: string
}
