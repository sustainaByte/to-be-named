import { BadRequestException, ForbiddenException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import * as dotenv from "dotenv"

import { EmployeeController } from "src/controllers"
import { User } from "src/db/schemas"
import { UserRepository } from "src/repositories"
import { UserService } from "src/services"
import { CustomLogger } from "src/utils"
import { CreateEmployeeDto, UpdateEmployeeDto } from "src/dto"
import { DateInterval, UserRequest } from "src/@types"
import { RolesGuard } from "src/guards/RolesGuard"

dotenv.config()

const userRepositoryMock = {
  find: jest.fn(),
  toObjectId: jest.fn(),
}

const userServiceMock = {
  createEmployee: jest.fn(),
  findEmployee: jest.fn(),
  findEmployeesBasedOnCriteria: jest.fn(),
  getEmployeeRecords: jest.fn(),
  updateEmployee: jest.fn(),
  createEmployeeTimesheet: jest.fn(),
}

const rolesGuardMock = {
  canActivate: jest.fn().mockReturnValue(true),

  denyAccess: () => {
    rolesGuardMock.canActivate.mockReturnValue(false)
  },
}

const customLoggerMock = {
  log: jest.fn(),
  error: jest.fn(),
}
//
describe("EmployeeController", () => {
  let controller: EmployeeController
  let userModel: Model<User>
  let userRepository: UserRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: CustomLogger,
          useValue: customLoggerMock,
        },
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },

        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CustomLogger,
          useValue: customLoggerMock,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile()

    controller = module.get<EmployeeController>(EmployeeController)
    userRepository = module.get<UserRepository>(UserRepository)
    userModel = module.get<Model<User>>(getModelToken(User.name))
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("Create a new employee", () => {
    it("should create a new employee", async () => {
      const createEmployeeDto: CreateEmployeeDto = {
        employmentType: 8,
        email: "test@example.com",
        name: "Test",
        surname: "Tester",
        phoneNumber: "123456789",
        emergencyNumber: "123456789",
        projects: [
          {
            projectId: "123456789",
            positionId: "123456789",
          },
        ],
        address: {
          city: "Test",
          country: "Test",
          street: "Test",
          streetNumber: "123",
        },
      }

      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
      }

      userServiceMock.createEmployee.mockResolvedValue(createEmployeeDto)

      const response = await controller.registerEmployee(
        createEmployeeDto,
        userRequest as unknown as UserRequest,
      )

      expect(response).toEqual({
        data: createEmployeeDto,
      })
    })

    it("should handle errors during employee creation", async () => {
      const createEmployeeDto: CreateEmployeeDto = {
        employmentType: 8,
        email: "johndoe@example.com",
        name: "John",
        surname: "Doe",
        phoneNumber: "123456789",
        emergencyNumber: "123456789",
        projects: [
          {
            projectId: "123456789",
            positionId: "123456789",
          },
        ],
        address: {
          city: "New York",
          country: "USA",
          street: "123 Main St",
          streetNumber: "456",
        },
      }

      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
      }

      userServiceMock.createEmployee.mockRejectedValue(new Error("Test error"))

      try {
        await controller.registerEmployee(
          createEmployeeDto,
          userRequest as unknown as UserRequest,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe("Test error")
      }
    })
    it("should throw ForbiddenException if user doesn't have access", async () => {
      const createEmployeeDto: CreateEmployeeDto = {
        employmentType: 8,
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        phoneNumber: "412341",
        emergencyNumber: "4123512",
        projects: [
          {
            projectId: "123456789",
            positionId: "123456789",
          },
        ],
        address: {
          city: "New York",
          country: "USA",
          street: "123 Main St",
          streetNumber: "456",
        },
      }

      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: new Types.ObjectId(),
          roles: [{ name: "Role 1", priority: 1 }],
        },
      }

      rolesGuardMock.denyAccess()

      try {
        await controller.registerEmployee(
          createEmployeeDto,
          userRequest as unknown as UserRequest,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toContain("error")
      }
    })
  })

  describe("Update an employee", () => {
    it("should update an employee", async () => {
      const updateEmployeeDto: UpdateEmployeeDto = {
        name: "John",
        surname: "Doe",
        email: "test@test.com",
      }

      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
      }

      const employeeId = process.env.TEST_GENERAL_ID

      userServiceMock.updateEmployee.mockResolvedValue(updateEmployeeDto)

      const response = await controller.updateEmployee(
        employeeId,
        userRequest as unknown as UserRequest,
        updateEmployeeDto,
      )

      expect(response).toEqual({
        data: updateEmployeeDto,
      })
    })
    it("should handle errors during employee update", async () => {
      const updateEmployeeDto: UpdateEmployeeDto = {
        name: "John",
        surname: "Doe",
        email: "test@test.com",
      }

      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
      }

      const employeeId = process.env.TEST_GENERAL_ID

      userServiceMock.updateEmployee.mockRejectedValue(
        new Error("Test error message"),
      )

      try {
        await controller.updateEmployee(
          employeeId,
          userRequest as unknown as UserRequest,
          updateEmployeeDto,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe("Test error message")
      }
    })
  })

  describe("Get Employees", () => {
    it("should return users when both projectId and departmentId are not provided", async () => {
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
        query: {},
      }

      const expectedUsers = [
        {
          _id: "1",
          name: "Department 1",
          description: "Description 1",
        },
      ]

      userRepositoryMock.find.mockResolvedValue(expectedUsers)

      const response = await controller.getEmployees(
        userRequest as unknown as UserRequest,
      )

      expect(response).toEqual({ data: expectedUsers })
    })
    it("should return employees by projectId when projectId is provided", async () => {
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
        query: {},
      }
      const projectId = "6509a741d5965b0777d392f6"
      const expectedUsers = [
        {
          _id: "1",
          name: "Department 1",
          description: "Description 1",
        },
      ]

      const type = "project"
      userServiceMock.findEmployeesBasedOnCriteria.mockResolvedValue(
        expectedUsers,
      )

      const response = await controller.getEmployees(
        userRequest as unknown as UserRequest,
        projectId,
        type,
      )
      expect(response).toEqual({ data: expectedUsers })
    })
    it("should return employees by departmentId when departmentId is provided", async () => {
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
        query: {},
      }
      const departmentId = "6509a741d5965b0777d392f6"
      const expectedUsers = [
        {
          _id: "1",
          name: "Department 1",
          description: "Description 1",
        },
      ]
      const type = "department"
      userServiceMock.findEmployeesBasedOnCriteria.mockResolvedValue(
        expectedUsers,
      )

      const response = await controller.getEmployees(
        userRequest as unknown as UserRequest,
        departmentId,
        type,
      )
      expect(response).toEqual({ data: expectedUsers })
    })
  })
  describe("logTime", () => {
    it("should create a new employee record", async () => {
      const employeeId = process.env.TEST_GENERAL_ID
      const request = {
        user: { email: "test@example.com" },
      }
      const createEmployeeRecordsDto = {
        startTime: Date.now(),
        endTime: Date.now() + 3600000, // 1 hour later
      }
      const response = {
        userId: "123",
        records: [{ ...createEmployeeRecordsDto }],
      }

      userServiceMock.createEmployeeTimesheet.mockResolvedValue(response)

      const result = await controller.logTime(
        request as unknown as UserRequest,
        employeeId,
        createEmployeeRecordsDto,
      )

      expect(result).toEqual({
        data: response,
      })
    })
    it("should handle exceptions and return a BadRequestException", async () => {
      const employeeId = process.env.TEST_GENERAL_ID
      const request = {
        user: { email: "test@example.com" },
      }
      const createEmployeeRecordsDto = {
        startTime: Date.now(),
        endTime: Date.now() + 3600000, // 1 hour later
      }

      userServiceMock.createEmployeeTimesheet.mockRejectedValue(
        new BadRequestException("Test error message"),
      )

      await expect(
        controller.logTime(
          request as unknown as UserRequest,
          employeeId,
          createEmployeeRecordsDto,
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it("should throw an error when endTime is before startTime", async () => {
      const employeeId = process.env.TEST_GENERAL_ID
      const request = {
        user: { email: "test@example.com" },
      }
      const startTime = Date.now()
      const endTime = startTime + 3600000 // 1 hour earlier

      userServiceMock.createEmployeeTimesheet.mockRejectedValue(
        new BadRequestException("Test error message"),
      )

      await expect(
        controller.logTime(request as unknown as UserRequest, employeeId, {
          startTime,
          endTime,
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })
  describe("getRecords", () => {
    it("should return records for a logged user", async () => {
      const employeeId = process.env.TEST_GENERAL_ID
      const request: Partial<UserRequest> = {
        user: {
          email: "test@example.com",
        },
        query: {
          startDate: "1696156592000",
          endDate: "1696502192000",
        },
      }
      const dateInterval: DateInterval = {
        startDate: "1696156592000",
        endDate: "1696502192000",
      }

      const expectedRecords = {
        2023: {
          9: {
            24: {
              workingHours: 8 * 3600000,
              startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
              endTime: Date.now(),
              totalHoursWorked: 7 * 8 * 3600000,
              overtimeHours: 0,
            },
          },
        },
      }

      userServiceMock.getEmployeeRecords.mockResolvedValue(expectedRecords)

      const result = await controller.getEmployeeRecords(
        request as unknown as UserRequest,
        employeeId,
        dateInterval,
      )

      expect(result).toEqual({
        data: expectedRecords,
      })
    })
  })
})
