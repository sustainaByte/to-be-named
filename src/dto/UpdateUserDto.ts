import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsEmail, IsNumberString } from "class-validator"
import { AddressDto } from "./AddressDto"

export class UpdateUserDto {
    @ApiProperty({ description: "id", example: "12386745324523" })
    @IsNotEmpty()
    @IsString()
    readonly id: string

    @ApiProperty({ description: "User name", example: "Andrei" })
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @ApiProperty({ description: "User surname", example: "Popescu" })
    @IsString()
    @IsNotEmpty()
    readonly surname: string

    @ApiProperty({ description: "User email", example: "test@sustainabyte.ro" })
    @IsEmail()
    @IsNotEmpty()
    readonly email: string

    @ApiProperty({ description: "User phone number", example: "0722222222" })
    @IsNumberString()
    @IsNotEmpty()
    readonly phoneNumber: string

    @ApiProperty({ description: "User address" })
    @IsNotEmpty()
    readonly address: AddressDto
}
