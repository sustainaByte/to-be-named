import { BadRequestException, Injectable } from "@nestjs/common"
import { JwtPayload } from "src/@types"
import { Post } from "src/db/schemas"

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

  async getAllPosts(): Promise<Array<Post>> {
    try {
      const posts = (await this.postRepository.find({})) as Post[]

      return posts
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async getPost(postId: string): Promise<Post> {
    try {
      const post = (await this.postRepository.findOne({
        _id: this.postRepository.toObjectId(postId),
      })) as Post

      return post
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async getPersonalPosts(userId: string): Promise<Array<Post>> {
    try {
      const posts = (await this.postRepository.find({
        creatorId: this.postRepository.toObjectId(userId),
      })) as Post[]

      return posts
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async togglePostLike(postId: string, userId: string): Promise<Post> {
    try {
      const post = (await this.postRepository.findOne({
        _id: this.postRepository.toObjectId(postId),
      })) as Post

      if (!post) throw new BadRequestException("Post not found")

      const userHasLiked = post.kudos.includes(userId)

      if (userHasLiked) {
        post.kudos = post.kudos.filter((id) => id !== userId)

        await this.postRepository.update(
          { _id: this.postRepository.toObjectId(postId) },
          { kudos: post.kudos },
        )
      } else {
        post.kudos.push(userId)

        await this.postRepository.update(
          { _id: this.postRepository.toObjectId(postId) },
          { kudos: post.kudos },
        )
      }
      return post
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
