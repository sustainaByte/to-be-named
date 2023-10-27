import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import * as jwt from "jsonwebtoken"
import * as dotenv from "dotenv"

import { DepartmentController } from "src/controllers"
import { DepartmentRepository } from "src/repositories"
import { DepartmentService } from "src/services"
import { CustomLogger } from "src/utils"
import { CreateDepartmentDto } from "src/dto"
import { Department, User, Role } from "src/db/schemas"
import { RolesGuard } from "src/guards/RolesGuard"
import { UpdateDepartmentDto } from "src/dto"
import { AuthService } from "src/services"
import { UserRequest, Department as DepartmentType } from "src/@types"

dotenv.config()

const departmentRepositoryMock = {
  find: jest.fn(),
  toObjectId: jest.fn(),
  findById: jest.fn(),
}

const departmentServiceMock = {
  createDepartment: jest.fn(),
  deleteDepartment: jest.fn(),
  updateDepartment: jest.fn(),
}

const customLoggerMock = {
  log: jest.fn(),
  error: jest.fn(),
}

const tokenWithAdmin = jwt.sign(
  {
    roles: [process.env.TEST_ADMIN_ROLE_ID],
    organizationId: process.env.TEST_ORGANIZATION_ID,
  },
  process.env.JWT_SECRET_KEY,
  { expiresIn: process.env.RESET_JWT_TOKEN_EXPIRE },
)

const rolesGuardMock = {
  canActivate: jest.fn().mockReturnValue(true),

  denyAccess: () => {
    rolesGuardMock.canActivate.mockReturnValue(false)
  },
}

describe("DepartmentController", () => {
  let controller: DepartmentController
  let departmentRepository: DepartmentRepository
  let departmentService: DepartmentService
  let departmentModel: Model<Department>
  let userModel: Model<User>
  let roleModel: Model<Role>
  let customLogger: CustomLogger
  let rolesGuard: RolesGuard
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        {
          provide: DepartmentRepository,
          useValue: departmentRepositoryMock,
        },
        {
          provide: DepartmentService,
          useValue: departmentServiceMock,
        },
        {
          provide: CustomLogger,
          useValue: customLoggerMock,
        },
        {
          provide: getModelToken(Department.name),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(Role.name),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: RolesGuard,
          useValue: rolesGuardMock,
        },
        {
          provide: AuthService,
          useValue: {
            verifyToken: jest.fn().mockReturnValue({ roles: [] }),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile()

    controller = module.get<DepartmentController>(DepartmentController)
    departmentRepository =
      module.get<DepartmentRepository>(DepartmentRepository)
    departmentModel = module.get<Model<Department>>(
      getModelToken(Department.name),
    )
    customLogger = module.get<CustomLogger>(CustomLogger)
    userModel = module.get<Model<User>>(getModelToken(User.name))
    roleModel = module.get<Model<Role>>(getModelToken(Role.name))
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("getDepartments", () => {
    it("return list of departments within user organization", async () => {
      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
        headers: {
          authorization: `Bearer asd`,
        },
      }

      const mockDepartments = [
        {
          _id: "1",
          name: "Department 1",
          description: "Description 1",
          organizationId: new Types.ObjectId(),
        },
        {
          _id: "2",
          name: "Department 2",
          description: "Description 2",
          organizationId: new Types.ObjectId(),
        },
      ]

      departmentRepositoryMock.find.mockResolvedValue(mockDepartments)

      const response = await controller.findAllDepartments(
        request as unknown as UserRequest,
      )

      expect(response).toEqual({ data: mockDepartments })
    })
    it("should require an authorization token", async () => {
      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
        headers: {
          authorization: `Bearer asd`,
        },
      }
      rolesGuardMock.denyAccess()

      try {
        await controller.findAllDepartments(request as unknown as UserRequest)
      } catch (error) {
        expect(error.message).toContain("Unauthorized")
      }
    })
    it("should throw ForbiddenException if user doesn't have access", async () => {
      const mockDepartmentId = process.env.TEST_GENERAL_ID

      const mockDepartment = {
        _id: mockDepartmentId,
        name: "Department 1",
        description: "Description 1",
        organizationId: new Types.ObjectId(),
      }

      departmentRepositoryMock.find.mockResolvedValue(mockDepartment)

      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
        params: {
          id: mockDepartmentId,
        },
      }

      rolesGuardMock.denyAccess()

      try {
        await controller.findAllDepartments(request as unknown as UserRequest)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException)
        expect(error.message).toContain("Forbidden")
      }
    })
  })

  describe("Get a department info", () => {
    it("should return department info when found", async () => {
      const mockDepartmentId = process.env.TEST_DEPARTMENT_ID

      const mockDepartment = {
        _id: mockDepartmentId,
        name: "Department 1",
        description: "Description 1",
        organizationId: new Types.ObjectId(),
      }

      departmentRepositoryMock.findById.mockResolvedValue(mockDepartment)

      const response = await controller.findUserDepartment(mockDepartmentId)
      expect(response).toEqual({ data: mockDepartment })
    })

    it("should handle department not found", async () => {
      const mockDepartmentId = "64f439d8d1415a98198fa892"

      departmentRepositoryMock.find.mockResolvedValue(null)

      try {
        await controller.findUserDepartment(mockDepartmentId)
      } catch (error) {
        expect(error.response).toEqual({
          error: "Not Found",
          message: "Department not found",
          statusCode: 404,
        })
      }
    })

    it("should handle errors during fetching departments", async () => {
      const mockDepartmentId = "64f439d8d1415a98198fa892"

      departmentRepositoryMock.find.mockRejectedValue(
        new Error("Database error"),
      )

      try {
        await controller.findUserDepartment(mockDepartmentId)
      } catch (error) {
        expect(error.message).toBe("Database error")
      }
    })
  })
  describe("createDepartment", () => {
    it("should create a department", async () => {
      const depLeadId = new Types.ObjectId()
      const organizationId = new Types.ObjectId()

      const request = {
        user: {
          organizationId,
        },
      }

      const createDepartmentDto: CreateDepartmentDto = {
        name: "Test Department",
        description: "Test Description",
        depLeadId: depLeadId,
      }
      const createdDepartment: DepartmentType = {
        ...createDepartmentDto,
        organizationId: organizationId,
      }

      departmentServiceMock.createDepartment.mockResolvedValue(
        createdDepartment,
      )

      const response = await controller.createDepartment(
        createDepartmentDto,
        request as unknown as any,
      )

      expect(response).toEqual({
        data: createdDepartment,
      })
      expect(customLoggerMock.log).toHaveBeenCalledWith(
        `Department ${createDepartmentDto.name} was created`,
      )
    })

    it("should throw ConflictException if department already exists", async () => {
      const depLeadId = new Types.ObjectId()
      const createDepartmentDto: CreateDepartmentDto = {
        name: "Test Department",
        description: "Test Description",
        depLeadId: depLeadId,
      }
      const request = {
        headers: {
          authorization: `Bearer ${tokenWithAdmin}`,
        },
        user: {
          organizationId: new Types.ObjectId(),
        },
      }

      departmentServiceMock.createDepartment.mockRejectedValue(
        new ConflictException(),
      )

      try {
        await controller.createDepartment(
          createDepartmentDto,
          request as unknown as any,
        )
      } catch (thrownError) {
        expect(thrownError.constructor).toBe(ConflictException)
        expect(thrownError.message).toContain("Conflict")
      }
    })

    it("should handle errors during department creation", async () => {
      const depLeadId = new Types.ObjectId()
      const createDepartmentDto: CreateDepartmentDto = {
        name: "Test Department",
        description: "Test Description",
        depLeadId: depLeadId,
      }
      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
      }
      const error = new Error("Test error")

      departmentServiceMock.createDepartment.mockRejectedValue(error)

      try {
        await controller.createDepartment(
          createDepartmentDto,
          request as unknown as any,
        )
      } catch (err) {
        expect(err).toBe(error)
        expect(customLoggerMock.error).toHaveBeenCalledWith(error)
      }
    })
  })
  describe("deleteDepartment", () => {
    it("should delete a department", async () => {
      const departmentId = new Types.ObjectId()
      const deletedDepartmentMock = {
        _id: departmentId,
      }

      departmentServiceMock.deleteDepartment.mockResolvedValue(
        deletedDepartmentMock,
      )

      const response = await controller.deleteDepartment(
        departmentId.toString(),
        {
          user: { roles: [process.env.TEST_ADMIN_ROLE_ID] },
        } as any,
      )

      expect(response).toEqual({
        data: deletedDepartmentMock,
      })
      expect(customLogger.log).toHaveBeenCalledWith(
        `Department ${departmentId} was deleted`,
      )
    })

    it("should throw BadRequestException if department has associated projects", async () => {
      const departmentId = new Types.ObjectId()
      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
        params: {
          id: departmentId.toString(),
        },
      }

      try {
        await controller.deleteDepartment(
          departmentId.toString(),
          request as unknown as any,
        )
      } catch (thrownError) {
        expect(thrownError).toBeInstanceOf(BadRequestException)
        expect(thrownError.message).toEqual("Invalid request")
      }
    })

    it("should throw ForbiddenException if user doesn't have access", async () => {
      const departmentId = new Types.ObjectId()

      const mockDepartment = {
        _id: departmentId,
        name: "Department 1",
        description: "Description 1",
        organizationId: new Types.ObjectId(),
      }

      departmentRepositoryMock.find.mockResolvedValue(mockDepartment)

      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
        params: {
          id: departmentId.toString(),
        },
      }

      rolesGuardMock.denyAccess()

      try {
        await controller.deleteDepartment(
          mockDepartment._id.toString(),
          request as unknown as UserRequest,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException)
        expect(error.message).toContain("Forbidden")
      }
    })
    it("should handle errors during department deletion", async () => {
      const departmentId = new Types.ObjectId()
      const error = new Error("Test error")
      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
        params: {
          id: departmentId.toString(),
        },
      }

      departmentServiceMock.deleteDepartment.mockRejectedValue(error)

      try {
        await controller.deleteDepartment(
          departmentId.toString(),
          request as unknown as any,
        )
      } catch (err) {
        expect(err).toBe(error)
        expect(customLogger.error).toHaveBeenCalledWith(error)
      }
    })
  })
  describe("updateDepartment", () => {
    it("should throw an Unauthorized exception when the user is not part of the department's organization", async () => {
      const departmentId = process.env.TEST_GENERAL_ID
      const updateDepartmentDto: UpdateDepartmentDto = {
        name: "string",
        depLeadId: new Types.ObjectId(),
        description: "asddd",
      }

      const request = {
        headers: {
          authorization: `Bearer ${tokenWithAdmin}`,
        },
      }

      departmentServiceMock.updateDepartment.mockRejectedValue(
        new UnauthorizedException("Unauthorized"),
      )
      try {
        await controller.updateDepartment(
          updateDepartmentDto,
          departmentId,
          request as any,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException)
      }
    })

    it("should update a department when provided with valid input and token", async () => {
      const organizationId = process.env.TEST_GENERAL_ID

      const updateDepartmentDto: UpdateDepartmentDto = {
        name: "string",
        depLeadId: new Types.ObjectId(),
        description: "asddd",
      }

      const request = {
        headers: {
          authorization: `Bearer ${tokenWithAdmin}`,
        },
        user: {
          organizationId,
        },
      }

      const departmentId = process.env.TEST_GENERAL_ID

      const updatedDepartmentMock = {
        ...updateDepartmentDto,
        _id: process.env.TEST_GENERAL_ID,
        organizationId,
      }

      departmentServiceMock.updateDepartment.mockResolvedValue(
        updatedDepartmentMock,
      )

      const response = await controller.updateDepartment(
        updateDepartmentDto,
        departmentId,
        request as any,
      )
      expect(response).toEqual({ data: updatedDepartmentMock })
    })

    it("should throw ForbiddenException if user doesn't have access", async () => {
      const departmentId = new Types.ObjectId()

      const updateDepartmentDto: UpdateDepartmentDto = {
        name: "string",
        depLeadId: new Types.ObjectId(),
        description: "asddd",
      }

      const updatedDepartmentMock = {
        _id: "64f816e76ecbee03604aa92b",
        name: "should work",
        description: "The 33th department",
        depLeadId: "test dep lead",
        organizationId: "64f81752c476ce0450ef33b9",
      }
      //
      departmentRepositoryMock.find.mockResolvedValue(updatedDepartmentMock)

      const request = {
        user: {
          organizationId: new Types.ObjectId(),
        },
        params: {
          id: departmentId.toString(),
        },
      }

      rolesGuardMock.denyAccess()

      try {
        await controller.updateDepartment(
          updateDepartmentDto,
          departmentId.toString(),
          request as unknown as UserRequest,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException)
        expect(error.message).toContain("Forbidden")
      }
    })
  })
})
