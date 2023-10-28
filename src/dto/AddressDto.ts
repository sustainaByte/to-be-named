import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class AddressDto {
  @ApiProperty({ description: "City" })
  @IsOptional()
  @IsString()
  readonly city?: string

  @ApiProperty({ description: "Country" })
  @IsOptional()
  @IsString()
  readonly country?: string

  @ApiProperty({ description: "Street" })
  @IsOptional()
  @IsString()
  readonly street?: string

  @ApiProperty({ description: "Street number" })
  @IsOptional()
  @IsString()
  readonly streetNumber?: string
}
