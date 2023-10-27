import { BadRequestException, Injectable } from "@nestjs/common"

import { UserRole } from "src/@types"
import { Project } from "src/db/schemas"
import { CreateProjectDto } from "src/dto"
import {
  DepartmentRepository,
  PositionRepository,
  ProjectRepository,
  RoleRepository,
  UserRepository,
} from "src/repositories"
import { formatErrorResponse, checkEqualFields } from "src/utils/index"

@Injectable()
export class ProjectService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly positionRepository: PositionRepository,
  ) {}

  async findAllProjects(
    userOrganizationId: string,
  ): Promise<Project[] | Project> {
    try {
      const pipeline = [
        {
          $lookup: {
            from: "departments",
            localField: "departmentId",
            foreignField: "_id",
            as: "department",
          },
        },
        {
          $match: {
            "department.organizationId":
              this.projectRepository.toObjectId(userOrganizationId),
          },
        },
        {
          $project: {
            department: 0,
          },
        },
      ]
      const projects = await this.projectRepository.findAdvanced(pipeline)

      return projects
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async createProject(
    createProjectDto: CreateProjectDto,
    userOrganizationId: string,
  ): Promise<Project> {
    if (createProjectDto.projectLead) {
      const projLead = await this.userRepository.findById(
        createProjectDto.projectLead.toString(),
      )
      if (!projLead) {
        throw new BadRequestException("Invalid projectLead ID")
      }

      checkEqualFields(projLead.organizationId.toString(), userOrganizationId)

      const [projLeadRole, currentUserRole] = await Promise.all([
        this.roleRepository.find({ name: UserRole.PROJECT_LEAD }),
        this.roleRepository.findById(projLead.roles[0].toString()),
      ])

      if (currentUserRole.priority > projLeadRole[0].priority) {
        await this.userRepository.update(
          { _id: createProjectDto.projectLead.toString() },
          { roles: [projLeadRole[0]._id] },
        )
      }
    }

    const department = await this.departmentRepository.find({
      _id: createProjectDto.departmentId,
    })

    if (!department[0]) {
      throw new BadRequestException("Invalid department ID")
    }
    checkEqualFields(
      department[0].organizationId.toString(),
      userOrganizationId,
    )

    if (createProjectDto.positions) {
      const availablePositionIds = createProjectDto.positions.map(
        (positionId) => positionId,
      )

      const existingPositions = await this.positionRepository.find({
        _id: { $in: availablePositionIds },
        organizationId: this.projectRepository.toObjectId(userOrganizationId),
      })
      if (Array.isArray(existingPositions))
        if (existingPositions.length !== availablePositionIds.length) {
          throw new BadRequestException("Invalid position ID")
        }
    }

    try {
      const createdProject = this.projectRepository.create({
        ...createProjectDto,
        departmentId: this.projectRepository.toObjectId(
          createProjectDto.departmentId,
        ),
        projectLead: createProjectDto.projectLead
          ? this.projectRepository.toObjectId(createProjectDto.projectLead)
          : undefined,
      })

      return createdProject
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
