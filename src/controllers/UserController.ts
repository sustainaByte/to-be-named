import {
  Controller,
    Post,
    Patch,
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
import { LoginUserDto, RegisterUserDto } from "src/dto"
import { RolesGuard } from "src/guards/RolesGuard"
import { ERROR_BODY } from "src/constants"
import { UserService } from "src/services"
import { SwitchRoleDto } from "../dto/SwitchRoleDto"
import { UpdateUserDto } from "../dto/UpdateUserDto"


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
      await this.userService.registerUser(registerUserDto)
      this.logger.log(`User with ${registerUserDto.email} was created`)
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


    @Patch("/switch_standard")
    @ApiOperation({ summary: "Switch user to standard role" })
    @ApiResponse({
        status: 200,
        description: "User switched to standard role successfully",
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
        description: "Invalid request.",
        schema: ERROR_BODY,
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized access.",
        schema: ERROR_BODY,
    })
    async switchToStandardUser(@Body() id: SwitchRoleDto) {
        try {
            const updatedUser = await this.userService.switchToStandardUser(id);
            return formatSuccessResponse(updatedUser);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    @Patch("/switch_premium")
    @ApiOperation({ summary: "Switch user to premium role" })
    @ApiResponse({
        status: 200,
        description: "User switched to premium role successfully",
        schema: {
            properties: {
                data: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        surname: { type: "string" },
                        email: { type: "string" },
                        phoneNumber: { type: "string" }
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: "Invalid request.",
        schema: ERROR_BODY,
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized access.",
        schema: ERROR_BODY,
    })
    async switchToPremiumUser(@Body() id: SwitchRoleDto) {
        try {
            const updatedUser = await this.userService.switchToPremiumUser(id);
            return formatSuccessResponse(updatedUser);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    @Patch("/edit_user")
    @ApiOperation({ summary: "Edit user's fields" })
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
                        phoneNumber: { type: "string" }
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description:
            "Invalid request.",
        schema: ERROR_BODY,
    })
    @ApiUnauthorizedResponse({
        description:
            "Unauthorized access.",
        schema: ERROR_BODY,
    })
    async updateUser(
        @Body() updateUserDto: UpdateUserDto
    ) {
        try {
            const updatedUser = await this.userService.updateUser(updateUserDto);
            return formatSuccessResponse(updatedUser);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
