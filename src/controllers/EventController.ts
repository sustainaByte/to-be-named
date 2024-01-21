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
  Patch,
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
import { USER_ROLE_DEFINITIONS, UserRequest, UserRole } from "src/@types"
import { CreateEventDto, UpdateEventDto } from "src/dto"
import { EventService } from "src/services/EventService"

@Controller("events")
@ApiTags("Events")
@UseGuards(RolesGuard)
export class EventController {
  constructor(
    @Inject(EventService)
    private readonly eventService: EventService,
    private readonly logger: CustomLogger,
  ) {}

  @Post("")
  @ApiOperation({ summary: "Create a new event" })
  @ApiResponse({
    status: 201,
    description: "Event created successfully",
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
            volunteers: { type: "array", items: { type: "string" } },
            donors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  amount: { type: "string" },
                },
              },
            },
            requiredMoney: { type: "number" },
            collectedMoney: { type: "number" },
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
      name: UserRole.PREMIUM,
      priority: USER_ROLE_DEFINITIONS.find((r) => r.name === UserRole.PREMIUM)
        ?.priority,
    },
  ])
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() request: UserRequest,
  ) {
    try {
      const response = await this.eventService.createEvent(
        createEventDto,
        request.user,
      )

      this.logger.log("Event created successfully")
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all events" })
  @ApiResponse({
    status: 200,
    description: "Events retrieved successfully",
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
            volunteers: { type: "array", items: { type: "string" } },
            donors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  amount: { type: "string" },
                },
              },
            },
            requiredMoney: { type: "number" },
            collectedMoney: { type: "number" },
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
  async getAllPosts() {
    try {
      const response = await this.eventService.getAllEvents()
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get(":eventId")
  @ApiOperation({ summary: "Get event by id" })
  @ApiResponse({
    status: 200,
    description: "Event retrieved successfully",
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
  async getPost(@Param("eventId") eventId: string) {
    try {
      const response = await this.eventService.getEvent(eventId)
      return formatSuccessResponse(response)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post(":eventId/like")
  @ApiOperation({ summary: "Like or unlike an event" })
  @ApiResponse({
    status: 200,
    description: "Event liked or unliked successfully",
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
            volunteers: { type: "array", items: { type: "string" } },
            donors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  amount: { type: "string" },
                },
              },
            },
            requiredMoney: { type: "number" },
            collectedMoney: { type: "number" },
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
  async togglePostLike(
    @Param("eventId") eventId: string,
    @Req() request: UserRequest,
  ) {
    try {
      const response = await this.eventService.toggleEventLike(
        eventId,
        request.user.userId,
      )

      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
  }

  @Patch(":eventId")
  @ApiOperation({ summary: "Update an event" })
  @ApiResponse({
    status: 200,
    description: "Event updated successfully",
    schema:
      // eslint-disable-next-line prettier/prettier
      {
        properties: {
          data: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              creatorId: { type: "string" },
              kudos: { type: "number" },
              mediaURL: { type: "array", items: { type: "string" } },
              volunteers: { type: "array", items: { type: "string" } },
              donors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    userId: { type: "string" },
                    amount: { type: "string" },
                  },
                },
              },
              requiredMoney: { type: "number" },
              collectedMoney: { type: "number" },
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
  async updateEvent(
    @Param("eventId") eventId: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    try {
      const response = await this.eventService.updateEvent(
        eventId,
        updateEventDto,
      )

      return formatSuccessResponse(response)
    } catch (error) {
      throw error
    }
  }
}
