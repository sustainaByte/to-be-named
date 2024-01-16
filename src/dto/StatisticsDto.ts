/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"
import { FileUploadDto } from '../dto/FileUploadDto'

export class StatisticsDto {
    @ApiProperty({ description: "Locations" })

    Locations: Map<string, number>;

}