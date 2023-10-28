import { Body, Controller, HttpCode, Post } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"

import { GoogleAuthVerifyDto } from "src/dto"
import { GoogleService } from "src/services"
import { CustomLogger, formatSuccessResponse } from "src/utils"

@Controller("google")
@ApiTags("Google Auth")
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly logger: CustomLogger,
  ) {}

  @ApiOperation({ summary: "Google auth verify" })
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
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @HttpCode(200)
  @Post("verify")
  async googleVerifyToken(@Body() googleAuthVerifyDto: GoogleAuthVerifyDto) {
    try {
      const response = await this.googleService.verify(
        googleAuthVerifyDto.accessToken,
      )
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
