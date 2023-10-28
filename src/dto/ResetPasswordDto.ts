import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, Matches, Length, IsOptional } from "class-validator"
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_LENGTH_MESSAGE,
} from "src/constants/messages"

export class ResetPasswordDto {
  @ApiProperty({ description: "Reset token", example: "abcd1234" })
  @IsNotEmpty()
  readonly resetToken: string

  @ApiProperty({ description: "New password" })
  @Length(8, 25, {
    message: PASSWORD_LENGTH_MESSAGE,
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  @IsNotEmpty()
  readonly newPassword: string

  @ApiProperty({ description: "Current password" })
  @IsOptional()
  readonly currentPassword?: string
}
