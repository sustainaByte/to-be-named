import {
  IsString,
  IsEmail,
  IsNumberString,
  IsNotEmpty,
  Length,
  Matches,
} from "class-validator"

import { AddressDto } from "./AddressDto"
import { ApiProperty } from "@nestjs/swagger"
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_LENGTH_MESSAGE,
} from "src/constants"

export class RegisterUserDto {
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

  @ApiProperty({ description: "User password", example: "Tes%2" })
  @Length(8, 25, {
    message: PASSWORD_LENGTH_MESSAGE,
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  @IsNotEmpty()
  readonly password: string

  @ApiProperty({ description: "User phone number", example: "0722222222" })
  @IsNumberString()
  @IsNotEmpty()
  readonly phoneNumber: number

  @ApiProperty({ description: "User address" })
  @IsNotEmpty()
  readonly address: AddressDto
}
