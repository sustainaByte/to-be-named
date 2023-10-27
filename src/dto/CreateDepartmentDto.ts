import { ApiProperty } from "@nestjs/swagger"
import { Types } from "mongoose"
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateDepartmentDto {
  @ApiProperty({ description: "Department name", example: "Internship" })
  @IsNotEmpty()
  @IsString()
  readonly name: string

  @ApiProperty({
    description: "Department description",
    example: "The internship department for current year",
  })
  @IsString()
  readonly description: string

  @ApiProperty({
    description: "Department lead",
    example: new Types.ObjectId(),
    type: Types.ObjectId,
  })
  @IsMongoId()
  @IsOptional()
  readonly depLeadId: Types.ObjectId
}
