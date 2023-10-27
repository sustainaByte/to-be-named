import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common"

import { Department } from "../db/schemas/index"
import { JwtPayload, UserRole } from "src/@types/index"
import { UpdateDepartmentDto, CreateDepartmentDto } from "src/dto/index"
import {
  CustomLogger,
  checkEqualFields,
  formatErrorResponse,
} from "src/utils/index"
import {
  DepartmentRepository,
  ProjectRepository,
  RoleRepository,
  UserRepository,
} from "src/repositories"

@Injectable()
export class DepartmentService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly logger: CustomLogger,
  ) {}

  async updateDepartment(
    departmentId: string,
    updateDepartmentDto: UpdateDepartmentDto,
    user: JwtPayload,
  ): Promise<Department> {
    try {
      const department = await this.departmentRepository.findById(departmentId)
      checkEqualFields(
        department.organizationId.toString(),
        user.organizationId,
      )
      const updatedDepartment = await this.departmentRepository.update(
        { _id: departmentId },
        updateDepartmentDto,
      )
      const response = updatedDepartment.toObject()
      delete response.organizationId

      return response
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
    userOrganizationId: string,
  ): Promise<Department> {
    try {
      if (createDepartmentDto.depLeadId) {
        const depLead = await this.userRepository.findById(
          createDepartmentDto.depLeadId.toString(),
        )

        checkEqualFields(depLead.organizationId.toString(), userOrganizationId)

        const [depLeadRole, currentUserRole] = await Promise.all([
          this.roleRepository.find({ name: UserRole.DEP_LEAD }),
          this.roleRepository.findById(depLead.roles[0].toString()),
        ])

        if (currentUserRole.priority > depLeadRole[0].priority) {
          await this.userRepository.update(
            { _id: createDepartmentDto.depLeadId.toString() },
            { roles: [depLeadRole[0]._id] },
          )
        }
      }

      const depLeadId = createDepartmentDto.depLeadId
        ? this.departmentRepository.toObjectId(createDepartmentDto.depLeadId)
        : null

      const createdDepartment = await this.departmentRepository.create({
        ...createDepartmentDto,
        depLeadId,
        organizationId:
          this.departmentRepository.toObjectId(userOrganizationId),
      })

      const response = createdDepartment.toObject()
      delete response.organizationId

      return response
    } catch (error) {
      if (error.code === 11000 || error instanceof ConflictException) {
        throw new ConflictException(formatErrorResponse(error))
      }
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async deleteDepartment(
    departmentId: string,
    userOrganizationId: string,
  ): Promise<Department> {
    try {
      const depToBeDeleted = await this.departmentRepository.findById(
        departmentId,
      )

      checkEqualFields(
        depToBeDeleted.organizationId.toString(),
        userOrganizationId,
      )

      const projectsAndUsersCount = await Promise.all([
        this.projectRepository.count({
          departmentId: this.departmentRepository.toObjectId(departmentId),
        }),
        this.userRepository.count({
          departmentId: this.departmentRepository.toObjectId(departmentId),
        }),
      ])

      const [projectsCount, usersCount] = projectsAndUsersCount

      if (projectsCount > 0 || usersCount > 0) {
        throw new BadRequestException(
          "The department has projects or users assigned to it",
        )
      }
      const deletedDepartment = await this.departmentRepository.delete(
        departmentId,
      )
      const response = deletedDepartment.toObject()
      delete response.organizationId

      return response
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
