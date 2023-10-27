import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty } from "class-validator"

export class ForgotPasswordDto {
  @ApiProperty({
    description: "User email for retrieving password",
    example: "andrei@test.com",
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string
}
