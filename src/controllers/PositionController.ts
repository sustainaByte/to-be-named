import {
  Controller,
  Get,
  UseGuards,
  SetMetadata,
  Req,
  HttpCode,
  Body,
  Post,
  Delete,
  Put,
  Param,
  Inject,
  ConflictException,
  BadRequestException,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

import { CustomLogger, formatErrorResponse } from "../utils"
import { RolesGuard } from "src/guards/RolesGuard"
import { UserRole, UserRequest, USER_ROLE_DEFINITIONS } from "src/@types"
import {
  BAD_REQUEST_EXCEPTION,
  ERROR_BODY,
  UNAUTHORIZED_EXCEPTION,
} from "src/constants"
import { formatSuccessResponse } from "src/utils"
import { CreatePositionDto, UpdatePositionDto } from "src/dto"
import { PositionService } from "src/services"
import { PositionRepository } from "src/repositories"

@ApiBearerAuth()
@Controller("positions")
@ApiTags("Positions")
@UseGuards(RolesGuard)
export class PositionController {
  constructor(
    @Inject(PositionService)
    private readonly positionService: PositionService,
    @Inject(PositionRepository)
    private readonly positionRepository: PositionRepository,
    private readonly logger: CustomLogger,
  ) {}

  @ApiOperation({ summary: "Get all positions from the organization" })
  @ApiResponse({
    status: 200,
    description: "Positions retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              __v: { type: "number" },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized, no access",
    schema: ERROR_BODY,
  })
  @Get("")
  @HttpCode(200)
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  async findAllPositions(@Req() request: UserRequest) {
    try {
      const filter = {
        organizationId: this.positionRepository.toObjectId(
          request.user.organizationId,
        ),
      }
      const response = await this.positionRepository.find(filter, [
        "-organizationId",
      ])
      this.logger.log(`User ${request.user.email} retrieved all positions`)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @ApiOperation({ summary: "Create position" })
  @ApiResponse({
    status: 201,
    description: "Position created successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: BAD_REQUEST_EXCEPTION,
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 401,
    description: UNAUTHORIZED_EXCEPTION,
    schema: ERROR_BODY,
  })
  @Post("")
  @HttpCode(201)
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  async createPosition(
    @Req() request: UserRequest,
    @Body() createPositionDto: CreatePositionDto,
  ) {
    try {
      const createdPosition = await this.positionRepository.create({
        ...createPositionDto,
        organizationId: this.positionRepository.toObjectId(
          request.user.organizationId,
        ),
      })

      const response = createdPosition.toObject()
      delete response.organizationId

      this.logger.log(
        `User ${request.user.email} created position ${createPositionDto.name}`,
      )
      return formatSuccessResponse(response)
    } catch (error) {
      if (error.code === 11000 || error instanceof ConflictException) {
        throw new ConflictException(formatErrorResponse(error))
      }
      this.logger.error(error)
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  @ApiResponse({
    status: 200,
    description: "Position deleted successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Data not found",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  @Delete("/:positionId")
  async deletePos(
    @Param("positionId") positionId: string,
    @Req() request: UserRequest,
  ) {
    try {
      const response = await this.positionService.deletePosition(
        positionId,
        request.user.organizationId,
      )

      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
  }

  @ApiResponse({
    status: 200,
    description: "Position updated successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Unauthorized, no access",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  @Put("/:positionId")
  async updatePosition(
    @Param("positionId") positionId: string,
    @Body() updatedPositionDto: UpdatePositionDto,
    @Req() request: UserRequest,
  ) {
    try {
      const response = await this.positionService.editPosition(
        positionId,
        updatedPositionDto,
        request.user.organizationId,
      )
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
