import { IsString, IsNumber, IsEmail } from "class-validator"

import { AddressDto } from "./AddressDto"

export class RegisterUserDto {
  @IsString()
  readonly name: string

  @IsString()
  readonly surname: string

  @IsEmail()
  readonly email: string

  @IsString()
  readonly password: string

  @IsNumber()
  readonly phoneNumber: number

  @IsString()
  readonly address: AddressDto
}
