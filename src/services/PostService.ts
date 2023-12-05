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

  async likePost(postId: string, userId: string): Promise<Post> {
    try {
      const post = (await this.postRepository.findOne({
        _id: this.postRepository.toObjectId(postId),
      })) as Post

      const index: number = post.kudos.indexOf(userId)

      if (index != -1)
        post.kudos.splice(index, 1)
      else
        post.kudos.push(userId)

      return post
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async getKudosForPost(postId: string): Promise<number> {
    try {
      const post = (await this.postRepository.findOne({
        _id: this.postRepository.toObjectId(postId),
      })) as Post

      return post.kudos.length;
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    try {
      const post = (await this.postRepository.findOne({
        _id: this.postRepository.toObjectId(postId),
      })) as Post

      const index: number = post.kudos.indexOf(userId)

      return index != -1
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}