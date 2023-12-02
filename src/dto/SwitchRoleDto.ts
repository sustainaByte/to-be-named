import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class SwitchRoleDto {
    @ApiProperty({ description: "id", example: "12386745324523" })
    @IsNotEmpty()
    @IsString()
    readonly id: string
}
