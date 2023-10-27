import {
  BadRequestException,
  Body,
  Post,
  Controller,
  Get,
  Param,
  Query,
  Req,
  SetMetadata,
  UseGuards,
  Inject,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"

import { BAD_REQUEST_EXCEPTION, ERROR_BODY } from "src/constants"
import { UserRole, UserRequest, USER_ROLE_DEFINITIONS } from "src/@types"
import { RolesGuard } from "src/guards/RolesGuard"
import { CustomLogger, formatSuccessResponse } from "src/utils"
import { checkIdFormat } from "src/utils"
import { formatErrorResponse } from "src/utils/responseHelper"
import { CreateProjectDto } from "src/dto"
import { ProjectService } from "src/services"
import { ProjectRepository } from "src/repositories"

@ApiBearerAuth()
@Controller("projects")
@ApiTags("Projects")
@UseGuards(RolesGuard)
export class ProjectController {
  constructor(
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
    @Inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
    private readonly logger: CustomLogger,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: "Projects retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              alias: { type: "string" },
              description: { type: "string" },
              positions: { type: "array", items: { type: "string" } },
              projectLead: { type: "string" },
              departmentId: { type: "string" },
              status: { type: "string" },
              board: { type: "string" },
              __v: { type: "number" },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid objectId format.",
    schema: ERROR_BODY,
  })
  @ApiResponse({ status: 401, description: "Unauthorized", schema: ERROR_BODY })
  @ApiResponse({
    status: 404,
    description: "Item not found.",
    schema: ERROR_BODY,
  })
  @ApiQuery({ name: "departmentId", required: false })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  async findProjects(
    @Req() request: UserRequest,
    @Query("departmentId") departmentId?: string,
  ) {
    try {
      if (Object.keys(request.query).length > 1) {
        throw new BadRequestException(
          formatErrorResponse({ message: BAD_REQUEST_EXCEPTION }),
        )
      } else if (departmentId) {
        checkIdFormat(departmentId)
        const filter = {
          departmentId: this.projectRepository.toObjectId(departmentId),
        }
        const response = await this.projectRepository.find(filter)
        this.logger.log(
          `User ${request.user.email} retrieved all projects with departmentId ${departmentId}`,
        )
        return formatSuccessResponse(response)
      } else {
        const response = await this.projectService.findAllProjects(
          request.user.organizationId,
        )
        this.logger.log(`User ${request.user.email} retrieved all projects`)
        return formatSuccessResponse(response)
      }
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get(":projectId")
  @ApiResponse({
    status: 200,
    description: "Project retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            alias: { type: "string" },
            description: { type: "string" },
            positions: { type: "array", items: { type: "string" } },
            projectLead: { type: "string" },
            departmentId: { type: "string" },
            status: { type: "string" },
            board: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid objectId format.",
    schema: ERROR_BODY,
  })
  @ApiResponse({ status: 401, description: "Unauthorized", schema: ERROR_BODY })
  @ApiResponse({
    status: 404,
    description: "Item not found.",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  async findProjectById(
    @Req() request: UserRequest,
    @Param("projectId") projectId: string,
  ) {
    try {
      checkIdFormat(projectId)
      const response = await this.projectRepository.findById(projectId)
      this.logger.log(
        `User ${request.user.email} retrieved project with id ${projectId}`,
      )
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
  @ApiOperation({ summary: "Create a new project" })
  @ApiResponse({
    status: 201,
    description: "Project created successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            positions: {
              type: "array",
              items: { type: "string" },
            },
            departmentId: { type: "string" },
            projectLead: { type: "string" },
            status: { type: "string" },
            _id: { type: "string" },
            __v: { type: "integer" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request",
    schema: ERROR_BODY,
  })
  @ApiResponse({ status: 401, description: "Unauthorized", schema: ERROR_BODY })
  @ApiResponse({
    status: 409,
    description: "The project already exists.",
    schema: ERROR_BODY,
  })
  @Post()
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() request: UserRequest,
  ) {
    if (createProjectDto.departmentId) {
      checkIdFormat(createProjectDto.departmentId)
    }
    try {
      const response = await this.projectService.createProject(
        createProjectDto,
        request.user.organizationId,
      )

      this.logger.log(`Project ${createProjectDto.name} was created`)
      return formatSuccessResponse(response)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(formatErrorResponse(error))
      }
      throw error
    }
  }
}
