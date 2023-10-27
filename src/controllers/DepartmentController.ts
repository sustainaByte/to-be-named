import {
  Controller,
  Get,
  Put,
  Req,
  SetMetadata,
  UnauthorizedException,
  NotFoundException,
  Param,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Delete,
  Inject,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

import { CreateDepartmentDto, UpdateDepartmentDto } from "src/dto"
import { RolesGuard } from "src/guards/RolesGuard"
import {
  formatSuccessResponse,
  CustomLogger,
  formatErrorResponse,
} from "src/utils"
import { checkIdFormat } from "src/utils"
import { ERROR_BODY } from "src/constants"
import { UserRole, UserRequest, USER_ROLE_DEFINITIONS } from "src/@types"
import { DepartmentService } from "src/services"
import { DepartmentRepository } from "src/repositories"

@ApiBearerAuth()
@Controller("departments")
@ApiTags("Departments")
@UseGuards(RolesGuard)
export class DepartmentController {
  constructor(
    @Inject(DepartmentService)
    private readonly departmentService: DepartmentService,
    @Inject(DepartmentRepository)
    private readonly departmentRepository: DepartmentRepository,
    private readonly logger: CustomLogger,
  ) {}

  @Post("")
  @ApiOperation({ summary: "Create a new department" })
  @ApiResponse({
    status: 201,
    description: "Department created successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            depLeadId: { type: "string" },
            _id: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid request",
    schema: ERROR_BODY,
  })
  @ApiConflictResponse({
    description: "The department already exists.",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized, no access",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: Number(
        USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)?.priority,
      ),
    },
  ])
  async createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Req() request: UserRequest,
  ) {
    try {
      const response = await this.departmentService.createDepartment(
        createDepartmentDto,
        request.user.organizationId,
      )
      this.logger.log(`Department ${createDepartmentDto.name} was created`)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "Departments retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              depLeadId: { type: "string" },
              __v: { type: "number" },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized", schema: ERROR_BODY })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: Number(
        USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)?.priority,
      ),
    },
  ])
  async findAllDepartments(@Req() request: UserRequest) {
    try {
      const filter = {
        organizationId: this.departmentRepository.toObjectId(
          request.user.organizationId,
        ),
      }
      const response = await this.departmentRepository.find(filter, [
        "-organizationId",
      ])
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get(":departmentId")
  @ApiResponse({
    status: 200,
    description: "User Department retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            depLeadId: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized", schema: ERROR_BODY })
  @ApiResponse({
    status: 404,
    description: "Department not found.",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid departmentId format.",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: Number(
        USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)?.priority,
      ),
    },
  ])
  async findUserDepartment(@Param("departmentId") departmentId: string) {
    try {
      checkIdFormat(departmentId)
      const response = await this.departmentRepository.findById(departmentId, [
        "-organizationId",
      ])
      if (!response) {
        throw new NotFoundException("Department not found")
      }
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Put("/:departmentId")
  @ApiResponse({
    status: 200,
    description: "Department updated successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            depLeadId: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "You do not have permission to update this department",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid departmentId format",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: Number(
        USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)?.priority,
      ),
    },
  ])
  async updateDepartment(
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Param("departmentId") departmentId: string,
    @Req() request: UserRequest,
  ) {
    checkIdFormat(departmentId)
    try {
      const response = await this.departmentService.updateDepartment(
        departmentId,
        updateDepartmentDto,
        request.user,
      )
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw new UnauthorizedException(formatErrorResponse(error))
    }
  }

  @Delete("/:departmentId")
  @ApiOperation({ summary: "Delete a department" })
  @ApiResponse({
    status: 200,
    description: "Department deleted successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            depLeadId: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid request",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized, no access",
    schema: ERROR_BODY,
  })
  @HttpCode(200)
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: Number(
        USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)?.priority,
      ),
    },
  ])
  async deleteDepartment(
    @Param("departmentId") departmentId: string,
    @Req() request: UserRequest,
  ) {
    try {
      const response = await this.departmentService.deleteDepartment(
        departmentId,
        request.user.organizationId,
      )
      this.logger.log(`Department ${departmentId} was deleted`)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
