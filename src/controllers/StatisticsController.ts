/* eslint-disable prettier/prettier */
import {
    Controller,
    Post,
    Body,
    HttpCode,
    UseGuards,
    Inject,
    Get,
    SetMetadata,
    Req,
    Param,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    Res,
} from "@nestjs/common"
import {
    ApiBadRequestResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger"

import { formatSuccessResponse, CustomLogger } from "src/utils/index"
import { RolesGuard } from "src/guards/RolesGuard"
import { ERROR_BODY } from "src/constants"
import { PostService, UploadService } from "src/services"
import { USER_ROLE_DEFINITIONS, UserRequest, UserRole } from "src/@types"
import { CreatePostDto } from "src/dto"
import { FileInterceptor } from "@nestjs/platform-express";
import { IsOptional } from "class-validator"
import { error } from "console"
import { StatisticsService } from "../services/StatisticsService"
@Controller("statistics")
@ApiTags("Statistics")
@UseGuards(RolesGuard)
export class StatisticsController {
    constructor(
        @Inject(StatisticsService)

        private readonly statisticsService: StatisticsService,
    ) { }

    @Post()
    
    @ApiOperation({ summary: "Create statistics" })
    @ApiResponse({
        status: 201,
        description: "Statistics created successfully",
        schema: {
            properties: {
                data: {
                    type: "object",
                    properties: {
                        locations: { type: "Map" }
                    },
                },
            },
        },
    })

    async createStatistics(
        
    ) {
        try {
            const response = await this.statisticsService.createStatistics();
            console.log(response);
            return Array.from(response.Locations.entries());
        } catch (error) {
            throw error
        }
    }

    @Get()
    @ApiOperation({ summary: "Get all posts" })
    @ApiResponse({
        status: 200,
        description: "Posts retrieved successfully",
        schema: {
            properties: {
                data: {
                    type: "object",
                    properties: {
                        
                    },
                },
            },
        },
    })
    
    @HttpCode(200)
    async getPost() {
        
        try {
            const response = await this.statisticsService.getStatistics()
            
            console.log(response)
            return formatSuccessResponse(response)
        } catch (error) {
            throw error
        }
    }
}