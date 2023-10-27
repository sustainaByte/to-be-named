import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { NOT_FOUND_EXCEPTION } from "src/constants"
import { Position } from "src/db/schemas"

import { UpdatePositionDto } from "src/dto"
import {
  PositionRepository,
  ProjectRepository,
  UserRepository,
} from "src/repositories"
import { formatErrorResponse, checkEqualFields } from "src/utils"

@Injectable()
export class PositionService {
  constructor(
    private readonly positionRepositiory: PositionRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async deletePosition(
    positionId,
    organizationId,
  ): Promise<{
    message: string
  }> {
    try {
      const position = await this.positionRepositiory.findById(positionId)
      checkEqualFields(organizationId, position.organizationId.toString())

      const deletedPosition = await this.positionRepositiory.delete(positionId)

      if (!deletedPosition) {
        throw new NotFoundException(NOT_FOUND_EXCEPTION)
      }

      const relatedProjects = await this.projectRepository.find({
        positions: positionId,
      })

      const projects = Array.isArray(relatedProjects)
        ? relatedProjects
        : [relatedProjects]
      for (const project of projects) {
        if (Array.isArray(project.positions) && project.positions.length > 0) {
          const positionsArray = project.positions as any
          positionsArray.pull(positionId)
          await project.save()
        }
      }

      const usersToUpdate = await this.userRepository.find({
        $or: [
          {
            "projects.positionId":
              this.positionRepositiory.toObjectId(positionId),
          },
          {
            "departments.positionId":
              this.positionRepositiory.toObjectId(positionId),
          },
        ],
      })

      const usersToUpdateArray = Array.isArray(usersToUpdate)
        ? usersToUpdate
        : [usersToUpdate]

      for (const user of usersToUpdateArray) {
        if (Array.isArray(user.projects) && user.projects.length > 0) {
          const projectsArray = user.projects as any
          for (const project of projectsArray) {
            if (project.positionId && project.positionId.equals(positionId)) {
              delete project.positionId
            }
          }
          user.markModified("projects")
          await user.save()
        }
      }

      return {
        message: `Position ${deletedPosition.name} deleted successfully`,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(formatErrorResponse(error))
      }
      throw formatErrorResponse(error)
    }
  }

  async editPosition(
    positionId: string,
    updatePositionDto: UpdatePositionDto,
    organizationId: string,
  ): Promise<Position | null> {
    try {
      const position = await this.positionRepositiory.findById(positionId)

      checkEqualFields(organizationId, position.organizationId.toString())
      const updatedPosition = await this.positionRepositiory.update(
        { _id: positionId },
        { ...updatePositionDto },
      )
      if (!updatedPosition) {
        throw new ForbiddenException(
          "You do not have permission to update this position",
        )
      }

      const response = updatedPosition.toObject()
      delete response.organizationId

      return response
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw formatErrorResponse(error)
      }
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
