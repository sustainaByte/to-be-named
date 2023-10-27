import { ApiProperty } from "@nestjs/swagger"
import { Types } from "mongoose"
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator"
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_LENGTH_MESSAGE,
} from "src/constants/messages"
import { EmploymentType } from "src/@types"

export class CreateOrganizationDto {
  @ApiProperty({ description: "User email", example: "andrei.test@hpm.ro" })
  @IsEmail()
  readonly email: string

  @ApiProperty({ description: "User phone number", example: "+40755661238" })
  @IsNumberString()
  readonly phoneNumber: string

  @ApiProperty({ description: "Company Name", example: "HyperMedia" })
  @IsString()
  readonly companyName: string

  @ApiProperty({
    description: "Number of employees",
    example: 30,
  })
  @IsNumber()
  readonly employeesNo: number

  @ApiProperty({
    description: "User password",
    example: "aNdrei&2",
    minLength: 8,
    maxLength: 25,
  })
  @Length(8, 25, {
    message: PASSWORD_LENGTH_MESSAGE,
  })
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).*$/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  readonly password: string

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType: number

  readonly roles: Types.ObjectId[]
}
