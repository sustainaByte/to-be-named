import { BadRequestException, Injectable } from "@nestjs/common"
import { JwtPayload } from "src/@types"
import { Post } from "src/db/schemas"

import { CreateEventDto } from "src/dto"
import { EventRepository } from "src/repositories"
import { formatErrorResponse } from "src/utils"

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(createEventDto: CreateEventDto, userRequest: JwtPayload) {
    try {
      console.log(userRequest)
      const createdEvent = await this.eventRepository.create({
        creatorId: this.eventRepository.toObjectId(userRequest.userId),
        ...createEventDto,
      })
      return createdEvent
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async getAllEvents(): Promise<Array<Post>> {
    try {
      const posts = (await this.eventRepository.find({})) as Post[]

      return posts
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async getEvent(eventId: string): Promise<Post> {
    try {
      const post = (await this.eventRepository.findOne({
        _id: this.eventRepository.toObjectId(eventId),
      })) as Post

      return post
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async getPersonalEvents(userId: string): Promise<Array<Post>> {
    try {
      const posts = (await this.eventRepository.find({
        creatorId: this.eventRepository.toObjectId(userId),
      })) as Post[]

      return posts
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async toggleEventLike(eventId: string, userId: string): Promise<Post> {
    try {
      const post = (await this.eventRepository.findOne({
        _id: this.eventRepository.toObjectId(eventId),
      })) as Post

      if (!post) throw new BadRequestException("Event not found")

      const userHasLiked = post.kudos.includes(userId)

      if (userHasLiked) {
        post.kudos = post.kudos.filter((id) => id !== userId)

        await this.eventRepository.update(
          { _id: this.eventRepository.toObjectId(eventId) },
          { kudos: post.kudos },
        )
      } else {
        post.kudos.push(userId)

        await this.eventRepository.update(
          { _id: this.eventRepository.toObjectId(eventId) },
          { kudos: post.kudos },
        )
      }
      return post
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
