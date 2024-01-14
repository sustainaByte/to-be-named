import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Inject,
  Get,
  Req,
  Param,
  Patch,
  SetMetadata,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

import {
  formatSuccessResponseDto,
  formatSuccessResponse,
  CustomLogger,
  checkEqualFields,
} from "src/utils/index"
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from "src/dto"
import { RolesGuard } from "src/guards/RolesGuard"
import { ERROR_BODY } from "src/constants"
import { EventService, PostService, UserService } from "src/services"
import { USER_ROLE_DEFINITIONS, UserRequest, UserRole } from "src/@types"

@Controller("users")
@ApiTags("Users")
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly logger: CustomLogger,
    private readonly postService: PostService,
    private readonly eventService: EventService,
  ) {}

  @Post("/register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            name: { type: "string" },
            surname: { type: "string" },
            email: { type: "string" },
            phoneNumber: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid request. Please ensure your input is valid and properly formatted.",
    schema: ERROR_BODY,
  })
  @ApiConflictResponse({
    description: "A user with the same email already exists.",
    schema: ERROR_BODY,
  })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      await this.userService.registerUser(registerUserDto)
      this.logger.log(`User with ${registerUserDto.email} was created`)
      return formatSuccessResponseDto(
        registerUserDto,
        "name",
        "surname",
        "email",
        "phoneNumber",
        "address",
        "isOrganization",
      )
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post("/login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({
    status: 200,
    description: "User logged in successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            jwtToken: { type: "string" },
            refreshToken: { type: "string" },
            expiresIn: { type: "number" },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid request. Please ensure your input is valid and properly formatted.",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description:
      "Unauthorized access. Make sure your login credentials are correct.",
    schema: ERROR_BODY,
  })
  @HttpCode(200)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    try {
      const response = await this.userService.loginUser(loginUserDto)
      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
  }

  @Patch(":userId")
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            name: { type: "string" },
            surname: { type: "string" },
            email: { type: "string" },
            phoneNumber: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
            address: {
              type: "object",
              properties: {
                country: { type: "string" },
                city: { type: "string" },
                street: { type: "string" },
                number: { type: "string" },
                postalCode: { type: "string" },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid request. Please ensure your input is valid and properly formatted.",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    schema: ERROR_BODY,
  })
  @HttpCode(200)
  @SetMetadata("roles", [
    {
      name: UserRole.STANDARD_USER,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  async updateUser(
    @Param("userId") userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: UserRequest,
  ) {
    try {
      checkEqualFields(userId.toString(), req.user.userId.toString())
      const response = await this.userService.updateUser(userId, updateUserDto)
      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
  }

  @Get("/current")
  @ApiOperation({ summary: "Get current user" })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            name: { type: "string" },
            surname: { type: "string" },
            email: { type: "string" },
            phoneNumber: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
            address: {
              type: "object",
              properties: {
                country: { type: "string" },
                city: { type: "string" },
                street: { type: "string" },
                number: { type: "string" },
                postalCode: { type: "string" },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid request. Please ensure your input is valid and properly formatted.",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    schema: ERROR_BODY,
  })
  @HttpCode(200)
  @SetMetadata("roles", [
    {
      name: UserRole.STANDARD_USER,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  async getCurrentUser(@Req() req: UserRequest) {
    try {
      const userId = req.user.userId
      const response = await this.userService.getCurrentUser(userId)
      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
    }

  @Get(":userId")
  @ApiOperation({ summary: "Get user by id" })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            name: { type: "string" },
            surname: { type: "string" },
            email: { type: "string" },
            phoneNumber: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
            address: {
              type: "object",
              properties: {
                country: { type: "string" },
                city: { type: "string" },
                street: { type: "string" },
                number: { type: "string" },
                postalCode: { type: "string" },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid request. Please ensure your input is valid and properly formatted.",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    schema: ERROR_BODY,
  })
  @HttpCode(200)
  @SetMetadata("roles", [
    {
      name: UserRole.STANDARD_USER,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
    async getUserById(@Param("userId") userId: string) {
    try {
      const response = await this.userService.getCurrentUser(userId)
      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
  }

  @Get(":userId/posts")
  @ApiOperation({ summary: "Get all posts made by a user" })
  @ApiResponse({
    status: 200,
    description: "Posts retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              creatorId: { type: "string" },
              kudos: { type: "number" },
              mediaURL: { type: "array", items: { type: "string" } },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              _id: { type: "string" },
              __v: { type: "number" },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid request. Please ensure your input is valid and properly formatted.",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    schema: ERROR_BODY,
  })
  @HttpCode(200)
  @SetMetadata("roles", [
    {
      name: UserRole.STANDARD_USER,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  async getAllPostsByUser(
    @Param("userId") userId: string,
    @Req() req: UserRequest,
  ) {
    try {
      checkEqualFields(userId.toString(), req.user.userId.toString())
      const response = await this.postService.getPersonalPosts(userId)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get(":userId/events")
  @ApiOperation({ summary: "Get all events made by a user" })
  @ApiResponse({
    status: 200,
    description: "Events retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            creatorId: { type: "string" },
            kudos: { type: "number" },
            mediaURL: { type: "array", items: { type: "string" } },
            volunteers: { type: "array", items: { type: "string" } },
            donors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  amount: { type: "string" },
                },
              },
            },
            requiredMoney: { type: "number" },
            collectedMoney: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            _id: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid request. Please ensure your input is valid and properly formatted.",
    schema: ERROR_BODY,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
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
  @HttpCode(200)
  async getAllEventsByUser(
    @Param("userId") userId: string,
    @Req() req: UserRequest,
  ) {
    try {
      checkEqualFields(userId.toString(), req.user.userId.toString())
      const response = await this.eventService.getPersonalEvents(userId)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
