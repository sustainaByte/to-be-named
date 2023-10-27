import {
  Controller,
  Get,
  HttpCode,
  SetMetadata,
  UseGuards,
  Req,
  Param,
  Query,
  Post,
  Body,
  BadRequestException,
  Inject,
  Patch,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"

import {
  formatSuccessResponse,
  CustomLogger,
  formatErrorResponse,
} from "src/utils"
import { UserRepository } from "src/repositories"
import { RolesGuard } from "src/guards/RolesGuard"
import {
  UserRole,
  UserRequest,
  USER_ROLE_DEFINITIONS,
  DateInterval,
} from "src/@types"
import { BAD_REQUEST_EXCEPTION, ERROR_BODY } from "src/constants"
import { checkIdFormat } from "src/utils"
import {
  CreateTimesheetDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "src/dto"
import { UserService } from "src/services"

@Controller("employees")
@ApiBearerAuth()
@ApiTags("Employees")
@UseGuards(RolesGuard)
export class EmployeeController {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly logger: CustomLogger,
  ) {}
  @Get("")
  @HttpCode(200)
  @ApiOperation({ summary: "Get users" })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    content: {
      "application/json": {
        examples: {
          schema1: {
            value: {
              data: [
                {
                  _id: "1",
                  email: "user1@example.com",
                  name: "User",
                  phoneNumber: "07000000",
                },
              ],
            },
            summary: "Get all employees",
          },
          schema2: {
            value: {
              data: [
                {
                  _id: "1",
                  projectName: "Project Name",
                  name: "User",
                  position: "node",
                },
              ],
            },
            summary: "Get employees by project id",
          },
          schema3: {
            value: {
              data: [
                {
                  _id: "1",
                  departmentName: "Department Name",
                  name: "User",
                  position: "node",
                },
              ],
            },
            summary: "Get employees by department id",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Item not found.",
    schema: ERROR_BODY,
  })
  @ApiQuery({ name: "projectId", required: false })
  @ApiQuery({ name: "departmentId", required: false })
  @SetMetadata("roles", [
    {
      name: UserRole.STANDARD_USER,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  async getEmployees(
    @Req() request: UserRequest,
    @Query("projectId") projectId?: string,
    @Query("departmentId") departmentId?: string,
  ) {
    try {
      if (Object.keys(request.query).length > 1) {
        throw new BadRequestException(BAD_REQUEST_EXCEPTION)
      } else if (projectId) {
        checkIdFormat(projectId)
        const users = await this.userService.findEmployeesBasedOnCriteria(
          projectId,
          request.user.organizationId,
          "project",
        )
        this.logger.log(
          `User ${request.user.email} retrieved all employees from project ${projectId}}`,
        )
        return formatSuccessResponse(users)
      } else if (departmentId) {
        checkIdFormat(departmentId)
        const users = await this.userService.findEmployeesBasedOnCriteria(
          departmentId,
          request.user.organizationId,
          "department",
        )
        this.logger.log(
          `User ${request.user.email} retrieved all employees from department ${departmentId}}`,
        )
        return formatSuccessResponse(users)
      } else {
        const filter = {
          organizationId: this.userRepository.toObjectId(
            request.user.organizationId,
          ),
        }

        const users = await this.userRepository.find(filter, [
          "_id email name phoneNumber",
        ])
        this.logger.log(`User ${request.user.email} retrieved all employees`)
        return formatSuccessResponse(users)
      }
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @ApiResponse({
    status: 404,
    description: "Item not found.",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request. Please check your input",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 200,
    description: "Employee retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" },
            surname: { type: "string" },
            phoneNumber: { type: "string" },
            emergencyNumber: { type: "string" },
            address: {
              type: "object",
              properties: {
                city: { type: "string" },
                country: { type: "string" },
                street: { type: "string" },
                streetNumber: { type: "string" },
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  projectId: { type: "string" },
                  positionId: { type: "string" },
                },
              },
            },
            departments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  departmentId: { type: "string" },
                  positionId: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  @Get("/:userId")
  async findEmployee(
    @Param("userId") userId: string,
    @Req() request: UserRequest,
  ) {
    try {
      checkIdFormat(userId)
      const user = await this.userRepository.find({
        _id: userId,
        organizationId: this.userRepository.toObjectId(
          request.user.organizationId,
        ),
      }, ["-password"])
      this.logger.log(`User ${request.user.email} retrieved their profile`)
      return formatSuccessResponse(user)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post("")
  @ApiOperation({ summary: "Register a new employee in the organization" })
  @ApiResponse({
    status: 201,
    description: "Employee created successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" },
            surname: { type: "string" },
            phoneNumber: { type: "string" },
            emergencyNumber: { type: "string" },
            address: {
              type: "object",
              properties: {
                city: { type: "string" },
                country: { type: "string" },
                street: { type: "string" },
                streetNumber: { type: "string" },
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  projectId: { type: "string" },
                  positionId: { type: "string" },
                },
              },
            },
            employmentType: { type: "string" },
            _id: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, no access",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request. Please check your input",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 409,
    description: "Item already exists.",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.ADMIN)
        ?.priority,
    },
  ])
  async registerEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() request: UserRequest,
  ) {
    try {
      const user = await this.userService.createEmployee(
        createEmployeeDto,
        request.user.organizationId,
      )
      this.logger.log(`Employee with ${createEmployeeDto.email} was created`)
      return formatSuccessResponse(user)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @ApiResponse({
    status: 200,
    description: "Employee updated successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" },
            surname: { type: "string" },
            phoneNumber: { type: "string" },
            emergencyNumber: { type: "string" },
            address: {
              type: "object",
              properties: {
                city: { type: "string" },
                country: { type: "string" },
                street: { type: "string" },
                streetNumber: { type: "string" },
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  projectId: { type: "string" },
                  positionId: { type: "string" },
                },
              },
            },
            employmentType: { type: "string" },
            _id: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request. Please check your input",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, no access",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 404,
    description: "Item not found.",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 409,
    description: "Item already exists.",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.STANDARD_USER,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  @Patch("/:userId")
  async updateEmployee(
    @Param("userId") userId: string,
    @Req() request: UserRequest,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    try {
      checkIdFormat(userId)
      const user = await this.userService.updateEmployee(
        userId,
        updateEmployeeDto,
        request.user,
      )
      this.logger.log(
        `Employee ${userId} was updated by ${request.user.userId}`,
      )
      return formatSuccessResponse(user)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @ApiResponse({
    status: 201,
    description: "Record created successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            userId: { type: "string" },
            records: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startTime: { type: "number" },
                  endTime: { type: "number" },
                  loggedHours: { type: "number" },
                  additionalNotes: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    schema: ERROR_BODY,
  })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  @Post(":employeeId/timesheets")
  async logTime(
    @Req() request: UserRequest,
    @Param("employeeId") employeeId: string,
    @Body() createTimesheetDto: CreateTimesheetDto,
  ) {
    try {
      checkIdFormat(employeeId)
      console.log("controller", createTimesheetDto.startTime)
      console.log("controller", createTimesheetDto.endTime)
      const response = await this.userService.createEmployeeTimesheet(
        request.user,
        employeeId,
        createTimesheetDto,
      )
      return formatSuccessResponse(response)
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  @ApiResponse({
    status: 200,
    description: "Records retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            year: {
              type: "object",
              properties: {
                month: {
                  type: "object",
                  properties: {
                    day: {
                      type: "object",
                      properties: {
                        workingHours: { type: "number" },
                        startTime: { type: "number" },
                        endTime: { type: "number" },
                        totalHoursWorked: { type: "number" },
                        overtimeHours: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
    schema: ERROR_BODY,
  })
  @ApiResponse({
    status: 401,
    description: "Unathorized",
    schema: ERROR_BODY,
  })
  @ApiQuery({ name: "startDate", required: true })
  @ApiQuery({ name: "endDate", required: true })
  @SetMetadata("roles", [
    {
      name: UserRole.ADMIN,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  @Get(":employeeId/timesheets")
  async getEmployeeRecords(
    @Req() request: UserRequest,
    @Param("employeeId") employeeId: string,
    @Query() dateInterval: DateInterval,
  ) {
    try {
      if (!request.query.startDate || !request.query.endDate) {
        throw new BadRequestException(
          formatErrorResponse({ message: BAD_REQUEST_EXCEPTION }),
        )
      }
      const { startDate, endDate } = dateInterval
      const response = await this.userService.getEmployeeRecords(
        request.user,
        startDate,
        endDate,
        employeeId,
      )
      this.logger.log(
        `Employee ${request.user.email} retrieved records successfully`,
      )
      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
  }
}
