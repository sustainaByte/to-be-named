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
  Param,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

import { formatSuccessResponse, CustomLogger } from "src/utils/index"
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

  @Get()
  @ApiOperation({ summary: "Get all posts" })
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
  async getAllPosts() {
    try {
      const response = await this.postService.getAllPosts()
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get(":postId")
  @ApiOperation({ summary: "Get all posts" })
  @ApiResponse({
    status: 200,
    description: "Posts retrieved successfully",
    schema: {
      properties: {
        data: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            creatorId: { type: "string" },
            kudos: { type: "number" },
            mediaURL: { type: "array", items: { type: "buffer" } },
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
  @HttpCode(200)
  async getPost(@Param("postId") postId: string) {
    try {
      const response = await this.postService.getPost(postId)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post(":postId/like")
  @ApiOperation({ summary: "Like or unlike a post" })
  @ApiResponse({
    status: 200,
    description: "Post liked or unliked successfully",
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
  async likePost(@Param("postId") postId: string, @Req() request: UserRequest){
    try{
      const response = await this.postService.likePost(postId, request.user.userId)

      return formatSuccessResponse(response)
    } catch(error){
      throw error
    }
  }

  @Get(":postId/kudos")
  @ApiOperation({ summary: "Get the number of kudos for the post" })
  @ApiResponse({
    status: 200,
    description: "Number of kudos for a post retrieved successfully",
    schema: {
      type: "number",
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
  async getKudosForPost(@Param("postId") postId: string) {
    try {
      const response = await this.postService.getKudosForPost(postId)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get(":postId/is-liked")
  @ApiOperation({ summary: "Find whether the post was liked by the user or not" })
  @ApiResponse({
    status: 200,
    description: "Response retrieved successfully",
    schema: {
      type: "boolean"
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
  async isPostLikedByUser(@Param("postId") postId: string, @Req() request: UserRequest) {
    try {
      const response = await this.postService.isPostLikedByUser(postId, request.user.userId)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}