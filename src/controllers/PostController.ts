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
import { RolesGuard } from "src/guards/RolesGuard"
import { ERROR_BODY } from "src/constants"
import { PostService } from "src/services"
import { USER_ROLE_DEFINITIONS, UserRequest, UserRole } from "src/@types"
import { CreatePostDto } from "src/dto"

@Controller("posts")
@ApiTags("Posts")
@UseGuards(RolesGuard)
export class PostController {
  constructor(
    @Inject(PostService)
    private readonly postService: PostService,
    private readonly logger: CustomLogger,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new post" })
  @ApiResponse({
    status: 201,
    description: "Post created successfully",
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
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            _id: { type: "string" },
            __v: { type: "number" },
          },
        },
      },
    },
  })
  @SetMetadata("roles", [
    {
      name: UserRole.STANDARD_USER,
      priority: USER_ROLE_DEFINITIONS.find(
        (r) => r.name === UserRole.STANDARD_USER,
      )?.priority,
    },
  ])
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() request: UserRequest,
  ) {
    try {
      const response = await this.postService.createPost(
        createPostDto,
        request.user,
      )

      this.logger.log("Post created successfully")
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
