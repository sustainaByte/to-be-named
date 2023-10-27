import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Inject,
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
} from "src/utils/index"
import { CreateOrganizationDto, LoginUserDto } from "src/dto"
import { RolesGuard } from "src/guards/RolesGuard"
import { ERROR_BODY } from "src/constants"
import { UserService } from "src/services"

@Controller("users")
@ApiTags("Users")
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly logger: CustomLogger,
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
      await this.userService.createOrganization(createOrganizationDto)
      this.logger.log(`User with ${createOrganizationDto.email} was created`)
      return formatSuccessResponseDto(
        registerUserDto,
        "name",
        "surname",
        "email",
        "phoneNumber",
      )
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post("login")
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
}
