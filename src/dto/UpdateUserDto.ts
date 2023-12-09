import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsEmail, IsNumberString, IsOptional } from "class-validator"
import { AddressDto } from "./AddressDto"

export class UpdateUserDto {
    @ApiProperty({ description: "User name", example: "Andrei" })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly name?: string

    @ApiProperty({ description: "User surname", example: "Popescu" })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly surname?: string

    @ApiProperty({ description: "User email", example: "test@sustainabyte.ro" })
    @IsEmail()
    @IsNotEmpty()
    @IsOptional()
    readonly email?: string

    @ApiProperty({ description: "User phone number", example: "0722222222" })
    @IsNumberString()
    @IsNotEmpty()
    @IsOptional()
    readonly phoneNumber?: string

    @ApiProperty({ description: "User address" })
    @IsNotEmpty()
    @IsOptional()
    readonly address?: AddressDto
}
