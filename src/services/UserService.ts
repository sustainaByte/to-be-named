import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

import {
  CONFLICT_EXCEPTION,
  CURRENT_TIMESTAMP,
  DATE_FORMAT,
  HOUR_IN_MILLISECONDS,
  REFRESH_TOKEN_EXP,
} from "src/constants"
import {
  CreateEmployeeDto,
  CreateTimesheetDto,
  CreateOrganizationDto,
  UpdateEmployeeDto,
} from "src/dto"
import { Department, Project, Role, User } from "src/db/schemas"
import {
  checkForHoliday,
  formatErrorResponse,
  generateRandomPassword,
  checkEqualFields,
} from "src/utils"
import { JwtPayload, UserRole } from "src/@types"
import {
  DepartmentRepository,
  OrganizationRepository,
  PositionRepository,
  ProjectRepository,
  RoleRepository,
  UserRepository,
} from "src/repositories"
import { EmailService } from "src/services"
import { format, isSameDay, isYesterday } from "date-fns"

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly roleRepository: RoleRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly positionRepository: PositionRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly emailService: EmailService,
  ) {}

  async createOrganization(
    createUserDto: CreateOrganizationDto,
  ): Promise<User> {
    const { companyName, employeesNo, phoneNumber, password } = createUserDto
    if (!companyName || !employeesNo || !phoneNumber || !password) {
      throw new BadRequestException({
        message: "Please fill in all required fields",
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const orgData = {
        companyName,
        employeesNo,
        phoneNumber,
      }

      const createdOrg = await this.organizationRepository.create(orgData)

      const adminRoleId = await this.roleRepository.find({
        name: UserRole.ADMIN,
      })

      const createdUser = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        roles: [adminRoleId[0]._id],
        organizationId: createdOrg._id,
      })

      return createdUser
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(formatErrorResponse(error))
      }
      throw error
    }
  }

  async loginUser(LogInDto: {
    email: string
    password: string
  }): Promise<object> {
    try {
      const { email, password } = LogInDto
      const user = (await this.userRepository.find({ email }, ["-__v"])) as User

      if (!user || !(await bcrypt.compare(password, user[0].password))) {
        throw new BadRequestException("Invalid credentials")
      }

      const payload: JwtPayload = {
        userId: user[0]._id,
        email: user[0].email,
        roles: user[0].roles,
        organizationId: user[0].organizationId,
        departmentId: user[0].departmentId,
      }

      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "3600s",
      })

      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: `${REFRESH_TOKEN_EXP}m`,
      })

      return { jwtToken, refreshToken, expiresIn: REFRESH_TOKEN_EXP }
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async findEmployeesBasedOnCriteria(
    id: string,
    organizationId: string,
    type: "project" | "department",
  ): Promise<User | User[]> {
    try {
      const matchField =
        type === "project" ? "projects.projectId" : "departments.departmentId"
      const response = (await this.userRepository.findAdvanced([
        {
          $match: {
            [matchField]: this.userRepository.toObjectId(id),
            organizationId: this.userRepository.toObjectId(organizationId),
          },
        },
        {
          $lookup: {
            from: "positions",
            localField:
              type === "project"
                ? "projects.positionId"
                : "departments.positionId",
            foreignField: "_id",
            as: "position",
          },
        },
        {
          $unwind: "$position",
        },
        {
          $lookup: {
            from: type === "project" ? "projects" : "departments",
            localField:
              type === "project"
                ? "projects.projectId"
                : "departments.departmentId",
            foreignField: "_id",
            as: type === "project" ? "project" : "department",
          },
        },
        {
          $unwind: type === "project" ? "$project" : "$department",
        },
        {
          $project: {
            _id: 1,
            name: 1,
            [type === "project" ? "projectName" : "departmentName"]:
              type === "project" ? "$project.name" : "$department.name",
            position: "$position.name",
          },
        },
      ])) as User[]

      if (response.length === 0) {
        throw new NotFoundException("No data found.")
      }

      return response
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(formatErrorResponse(error))
      }
      throw error
    }
  }

  private async processProjects(
    projects: any[],
    userOrganizationId: string,
  ): Promise<any[]> {
    if (!projects || projects.length === 0) {
      return null
    }

    return Promise.all(
      projects.map(async (project) => {
        const projectId = this.userRepository.toObjectId(project.projectId)
        let positionId = null

        const pipeline = [
          {
            $match: {
              _id: projectId,
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "departmentId",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $project: {
              department: 1,
            },
          },
        ]

        const projectToCheck = await this.projectRepository.findAdvanced(
          pipeline,
        )

        checkEqualFields(
          userOrganizationId.toString(),
          projectToCheck[0].department[0].organizationId.toString(),
        )

        if (project.positionId) {
          const positionToCheck = await this.positionRepository.findById(
            project.positionId,
          )
          checkEqualFields(
            userOrganizationId.toString(),
            positionToCheck.organizationId.toString(),
          )
          positionId = this.userRepository.toObjectId(project.positionId)
        }

        return { projectId: projectId.toString(), positionId }
      }),
    )
  }

  async createEmployee(
    createEmployeeDto: CreateEmployeeDto,
    userOrganizationId: string,
  ): Promise<User> {
    try {
      const newPassword = generateRandomPassword(12)
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      let projects = null

      if (createEmployeeDto.projects?.length > 0)
        projects = await this.processProjects(
          createEmployeeDto.projects,
          userOrganizationId,
        )

      const organizationId = this.userRepository.toObjectId(userOrganizationId)

      const role = await this.roleRepository.find({ name: "standard_user" })

      const employee = await this.userRepository.create({
        ...createEmployeeDto,
        projects,
        password: hashedPassword,
        roles: [role[0]._id],
        organizationId,
      })

      await this.emailService.sendCustomEmail(
        "Generated Password",
        createEmployeeDto.email,
        newPassword,
      )

      const response = employee.toObject()
      delete response.password
      delete response.roles
      delete response.organizationId

      return response
    } catch (error) {
      if (error.code === 11000 || error instanceof ConflictException) {
        throw new ConflictException(
          formatErrorResponse({ message: CONFLICT_EXCEPTION }),
        )
      }
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async updateEmployee(
    userIdToUpdate: string,
    updateEmployeeDto: UpdateEmployeeDto,
    requestUser: JwtPayload,
  ): Promise<User> {
    try {
      const employeeToBeUpdated = await this.userRepository.findOne({
        _id: userIdToUpdate,
      })
      if (
        !(await this.isAuthorizedForUpdate(
          employeeToBeUpdated,
          requestUser,
          updateEmployeeDto,
        ))
      ) {
        throw new ForbiddenException("You don't have access for update")
      }

      if (updateEmployeeDto.projects?.length > 0)
        updateEmployeeDto.projects = await this.processProjects(
          updateEmployeeDto.projects,
          requestUser.organizationId,
        )
      const result = await this.userRepository.update(
        { _id: userIdToUpdate },
        updateEmployeeDto,
      )
      const response = result.toObject()
      delete response.password
      delete response.roles
      delete response.organizationId

      return response
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(formatErrorResponse(error))
      }
      if (error.code === 11000 || error instanceof ConflictException) {
        throw new ConflictException(
          formatErrorResponse({ message: CONFLICT_EXCEPTION }),
        )
      }
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async isAuthorizedForUpdate(
    employeeToBeUpdated: User,
    requestUser: JwtPayload,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<boolean> {
    try {
      checkEqualFields(requestUser.organizationId.toString(), employeeToBeUpdated.organizationId.toString())
      const [
        requestUserRole,
        employeeToBeUpdatedRole,
        requestUserDepartment,
        employeeToBeUpdatedDepartment,
      ] = await Promise.all([
        this.roleRepository.findOne({
          _id: this.userRepository.toObjectId(requestUser.roles[0]),
        }),
        this.roleRepository.findOne({
          _id: this.userRepository.toObjectId(employeeToBeUpdated.roles[0]),
        }),
        this.departmentRepository.findOne({
          organizationId: this.userRepository.toObjectId(
            requestUser.organizationId,
          ),
        }),
        this.departmentRepository.findOne({
          organizationId: this.userRepository.toObjectId(
            employeeToBeUpdated.organizationId,
          ),
        }),
      ])
      switch (requestUserRole.name) {
        case UserRole.ADMIN:
          return true

        case UserRole.DEP_LEAD:
          checkEqualFields(
            requestUserDepartment._id.toString(),
            employeeToBeUpdatedDepartment._id.toString(),
          )
          if (requestUserRole.priority < employeeToBeUpdatedRole.priority) {
            return true
          } else if (!updateEmployeeDto.projects) {
            checkEqualFields(
              employeeToBeUpdated._id.toString(),
              requestUser.userId.toString(),
            )
            return true
          } else {
            return false
          }

        case UserRole.PROJECT_LEAD:
          const [requestUserProject, employeeToBeUpdatedProject] =
            await Promise.all([
              this.projectRepository.findOne({
                departmentId: this.userRepository.toObjectId(
                  requestUserDepartment._id,
                ),
              }),
              this.projectRepository.findOne({
                departmentId: this.userRepository.toObjectId(
                  employeeToBeUpdatedDepartment._id,
                ),
              }),
            ])
          checkEqualFields(
            requestUserProject._id.toString(),
            employeeToBeUpdatedProject._id.toString(),
          )
          if (requestUserRole.priority < employeeToBeUpdatedRole.priority) {
            return true
          } else if (!updateEmployeeDto.projects) {
            checkEqualFields(
              employeeToBeUpdated._id.toString(),
              requestUser.userId.toString(),
            )
            return true
          } else {
            return false
          }
        case UserRole.STANDARD_USER:
          checkEqualFields(
            employeeToBeUpdated._id.toString(),
            requestUser.userId.toString(),
          )
          if (!updateEmployeeDto.projects) return true
          return false
        default:
          return false
      }
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  isWeekendDay(timestamp: number) {
    const dayOfWeek = new Date(timestamp).getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  isValidTime(timestamp) {
    const today = new Date(CURRENT_TIMESTAMP)
    console.log("userService -> isValidTime -> CURRENT_TIMESTAMP", CURRENT_TIMESTAMP)
    console.log("userService -> isValidTime -> today", today)
    const isMonday = today.getDay() === 1
    console.log("userService -> isValidTime -> isMonday", isMonday)
    const lastFridayDay =
      new Date().getDate() + (6 - new Date().getDay() - 1) - 7
    console.log("userService -> isValidTime -> lastFridayDay", lastFridayDay)
    const lastFriday = new Date() //to be changed to last friday
    console.log("userService -> isValidTime -> lastFriday", lastFriday)
    lastFriday.setDate(lastFridayDay)
    console.log("userService -> isValidTime -> lastFriday", lastFriday)
    console.log("userService -> isValidTime -> date-fns-isSameDay", isSameDay(timestamp, CURRENT_TIMESTAMP))
    console.log("userService -> isValidTime -> date-fns-isYesterday", isYesterday(timestamp))
    console.log("userService -> isValidTime -> date-fns-isWeekendDay", this.isWeekendDay(timestamp))
    return (
      ((isSameDay(timestamp, CURRENT_TIMESTAMP) || isYesterday(timestamp)) &&
        !this.isWeekendDay(timestamp)) ||
      (isMonday && new Date(timestamp).getDate() === lastFriday.getDate())
    )
  }

  async createEmployeeTimesheet(
    userRequest: JwtPayload,
    employeeId: string,
    createTimesheetDto: CreateTimesheetDto,
  ) {
    const { startTime, endTime } = createTimesheetDto
    console.log("userService -> createEmployeeTimesheet -> startTime", startTime)
    console.log("userService -> createEmployeeTimesheet -> endTime", endTime)
    try {
      if (employeeId !== userRequest.userId) {
        throw new BadRequestException("EmployeeId mismatch")
      }
      const user = await this.userRepository.findById(employeeId)

      const isHoliday = await checkForHoliday(format(startTime, DATE_FORMAT))
      if (isHoliday) {
        throw new BadRequestException("The date entered is a holiday.")
      }

      console.log("userService -> createEmployeeTimesheet -> isSameDay", isSameDay(startTime, endTime))

      if (startTime >= endTime || !isSameDay(startTime, endTime)) {
        throw new BadRequestException(
          "Invalid dates. Start time should be before end time and within the same day.",
        )
      }

      console.log("userService -> createEmployeeTimesheet -> isValidTime", this.isValidTime(startTime))
      if (!this.isValidTime(startTime) || !this.isValidTime(endTime)) {
        throw new BadRequestException(
          "Invalid time. The time entered must be within the current or the previous working day.",
        )
      }

      const recordExists =
        user.timesheets &&
        user.timesheets.some((existingRecord) =>
          isSameDay(existingRecord.startTime, startTime),
        )

      if (recordExists) {
        throw new BadRequestException(
          "A record with the same date already exists",
        )
      }

      if (!user.timesheets) {
        user.timesheets = []
      }

      user.timesheets.push({
        ...createTimesheetDto,
        loggedHours: endTime - startTime - HOUR_IN_MILLISECONDS,
      })

      user.markModified("timesheets")
      const updatedUser = await user.save()
      const { _id, timesheets } = updatedUser

      return { userId: _id, timesheets }
    } catch (error) {
      throw error
    }
  }

  async checkRolePermissions(
    userRequest: JwtPayload,
    user: User,
    userLoggedInRole: Role,
    organizationId: string,
    employeeId: string,
  ): Promise<boolean> {
    if (
      userLoggedInRole.name === "admin" &&
      organizationId === user.organizationId.toString()
    ) {
      return true
    } else if (userLoggedInRole.name === "project_lead") {
      const userLoggedInProjects = (await this.projectRepository.find({
        projectLead: this.userRepository.toObjectId(userRequest.userId),
      })) as Project[]
      const projectIds = userLoggedInProjects.map((proj) => proj._id)

      const found = projectIds.some((id) =>
        user.projects?.find(
          (project) => project.projectId.toString() === id.toString(),
        ),
      )

      if (!found) {
        throw new BadRequestException("EmployeeId mismatch")
      }
      return true
    } else if (userLoggedInRole.name === "dep_lead") {
      const employeeProjectIds = user.projects.map((proj) => proj.projectId)
      const userDepartments = (await this.departmentRepository.find({
        depLeadId: this.userRepository.toObjectId(userRequest.userId),
      })) as Department[]
      const departmentIds = userDepartments.map((dep) => dep._id)
      const departmentProjects = (await this.projectRepository.find({
        departmentId: { $in: departmentIds },
        _id: { $in: employeeProjectIds },
      })) as Project[]
      if (!departmentProjects) {
        throw new BadRequestException("EmployeeId mismatch")
      }
      return true
    } else if (employeeId !== userRequest.userId) {
      throw new BadRequestException("EmployeeId mismatch")
    } else if (userLoggedInRole.name === "standard_user") {
      return true
    }
    return false
  }

  async getRecordsInChosenInterval(
    user: User,
    startDate: string,
    endDate: string,
  ): Promise<object[]> {
    const recordsInChosenInterval = user.timesheets?.filter((record) => {
      const recordDate = new Date(record.startTime)
      const recordTimestamp = recordDate.getTime()
      return (
        recordTimestamp >= parseInt(startDate, 10) &&
        recordTimestamp < parseInt(endDate, 10)
      )
    })
    return recordsInChosenInterval
  }

  async formatRecords(user: User, records: any[]): Promise<object> {
    const formattedRecords = {}

    records?.forEach((record) => {
      const recordDate = new Date(record.startTime)
      const year = recordDate.getFullYear()
      const month = recordDate.getMonth() + 1
      const day = recordDate.getDate()

      if (!formattedRecords[year]) {
        formattedRecords[year] = {}
      }

      if (!formattedRecords[year][month]) {
        formattedRecords[year][month] = {}
      }

      const loggedHoursInMilliseconds = record.loggedHours
      const employmentTypeInMilliseconds =
        user.employmentType * HOUR_IN_MILLISECONDS

      const overtimeHours =
        loggedHoursInMilliseconds - employmentTypeInMilliseconds

      formattedRecords[year][month][day] = {
        workingHours: employmentTypeInMilliseconds,
        startTime: record.startTime,
        endTime: record.endTime,
        totalHoursWorked: record.loggedHours,
        overtimeHours: overtimeHours >= 0 ? overtimeHours : 0,
      }
    })

    return formattedRecords
  }

  async getEmployeeRecords(
    userRequest: JwtPayload,
    startDate: string,
    endDate: string,
    employeeId: string,
  ): Promise<object> {
    try {
      const timeDifference = parseInt(endDate, 10) - parseInt(startDate, 10)
      const dayDifference = timeDifference / (1000 * 60 * 60 * 24)

      if (dayDifference > 365) {
        throw new BadRequestException(
          "The interval should not exceed one year.",
        )
      }

      const user = await this.userRepository.findById(employeeId)
      const userLoggedInRole = await this.roleRepository.find({
        _id: this.userRepository.toObjectId(userRequest.roles[0]),
      })

      const hasPermission = await this.checkRolePermissions(
        userRequest,
        user,
        userLoggedInRole[0],
        userRequest.organizationId,
        employeeId,
      )

      if (hasPermission) {
        const recordsInChosenInterval = await this.getRecordsInChosenInterval(
          user,
          startDate,
          endDate,
        )

        const formattedRecords = await this.formatRecords(
          user,
          recordsInChosenInterval,
        )

        return formattedRecords
      }

      return {}
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
