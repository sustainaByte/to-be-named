import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class LoginUserDto {
  @ApiProperty({ description: "User email", example: "test@sustainabyte.ro" })
  @IsNotEmpty()
  @IsString()
  readonly email: string

  @ApiProperty({ description: "User password", example: "Tes%2" })
  @IsNotEmpty()
  @IsString()
  readonly password: string
}
export class AuthResponseDto {
  @ApiProperty({ description: "JWT" })
  jwtToken: string
}

class ErrorResponseDto {}

export class LoginResponseDto {
  @ApiProperty({ type: AuthResponseDto })
  data: AuthResponseDto

  @ApiProperty({ type: [ErrorResponseDto], required: false })
  errors?: ErrorResponseDto[]
}
export class GoogleAuthVerifyDto {
  @ApiProperty({
    description: "Access Token from",
    example:
      "ya29.a0AfB_byCGwljo2imnguzuwKok6-EmtHmCMTccTzooPLtzXbahZEd7SefQA...FXpw0174",
  })
  @IsNotEmpty()
  @IsString()
  readonly accessToken: string
}
