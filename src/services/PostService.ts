import { BadRequestException, Injectable } from "@nestjs/common"
import { JwtPayload } from "src/@types"

import { CreatePostDto } from "src/dto"
import { PostRepository } from "src/repositories"
import { formatErrorResponse } from "src/utils"

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(createPostDto: CreatePostDto, userRequest: JwtPayload) {
    try {
      const createdPost = await this.postRepository.create({
        creatorId: this.postRepository.toObjectId(userRequest.userId),
        ...createPostDto,
      })

      return createdPost
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
