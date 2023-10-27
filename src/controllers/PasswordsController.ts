import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  Headers,
  Inject,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"

import { ResetPasswordDto, ForgotPasswordDto } from "src/dto"
import { formatSuccessResponseDto, CustomLogger } from "src/utils"
import { ERROR_BODY } from "src/constants"
import { PasswordService } from "src/services"

@Controller("passwords")
@ApiTags("Passwords")
export class PasswordsController {
  constructor(
    @Inject(PasswordService)
    private readonly passwordService: PasswordService,
    private readonly logger: CustomLogger,
  ) {}

  @Post("forgot")
  @ApiOperation({ summary: "Initiate forgot password process" })
  @ApiResponse({
    status: 200,
    description: "Forgot password process initiated successfully",
    schema: {
      properties: {
        data: {
          properties: {
            email: { type: "string" },
          },
        },
      },
    },
  })
  @HttpCode(200)
  @ApiBadRequestResponse({ description: "Bad Request", schema: ERROR_BODY })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.passwordService.forgotPassword(forgotPasswordDto)
      this.logger.log(
        `User with ${forgotPasswordDto.email} initiated forgot password process`,
      )
      const response = formatSuccessResponseDto(forgotPasswordDto, "email")
      return response
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Put("reset")
  @ApiResponse({
    status: 204,
    description: "Password reset successful",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {},
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: "Bad Request", schema: ERROR_BODY })
  @HttpCode(204)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers("authorization") authToken: string,
  ) {
    try {
      await this.passwordService.resetPassword(resetPasswordDto, authToken)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
