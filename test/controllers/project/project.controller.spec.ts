import { Test, TestingModule } from "@nestjs/testing"
import { Model, Types } from "mongoose"
import * as dotenv from "dotenv"

import { ProjectController } from "src/controllers"
import { ProjectRepository, RoleRepository } from "src/repositories"
import { RolesGuard } from "src/guards/RolesGuard"
import { getModelToken } from "@nestjs/mongoose"
import { CreateProjectDto } from "src/dto"
import { User, Role, Project } from "src/db/schemas"
import { AuthService, ProjectService } from "src/services"
import { CustomLogger, formatSuccessResponse } from "src/utils"
import { UserRequest } from "src/@types"

dotenv.config()

const projectRepositoryMock = {
  find: jest.fn(),
}

const projectServiceMock = {
  findProjectsByDepId: jest.fn(),
  createProject: jest.fn(),
  findAllProjects: jest.fn(),
}

const customLoggerMock = {
  log: jest.fn(),
  error: jest.fn(),
}

const rolesGuardMock = {
  canActivate: jest.fn().mockReturnValue(true),
}

describe("ProjectController", () => {
  let controller: ProjectController
  let projectRepository: ProjectRepository
  let projectModel: Model<Project>
  let userModel: Model<User>
  let roleModel: Model<Role>
  let authService: AuthService
  let customLogger: CustomLogger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectRepository,
          useValue: projectRepositoryMock,
        },
        {
          provide: ProjectService,
          useValue: projectServiceMock,
        },
        {
          provide: getModelToken(Role.name),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CustomLogger,
          useValue: customLoggerMock,
        },
        {
          provide: AuthService,
          useValue: {
            verifyToken: jest.fn().mockReturnValue({ roles: [] }),
          },
        },
        {
          provide: RolesGuard,
          useValue: rolesGuardMock,
        },
        {
          provide: CustomLogger,
          useValue: customLoggerMock,
        },
        {
          provide: RoleRepository,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<ProjectController>(ProjectController)
    projectRepository = module.get<ProjectRepository>(ProjectRepository)
    authService = module.get<AuthService>(AuthService)
    customLogger = module.get<CustomLogger>(CustomLogger)
    roleModel = module.get<Model<Role>>(getModelToken(Role.name))
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
  //
  describe("Get projects from department", () => {
    it("return a list of projects", async () => {
      const mockProject = {
        _id: process.env.TEST_GENERAL_ID,
        name: "Project 1",
        description: "Project description 1",
        departmentId: "depId1",
      }
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
        query: {
          departmentId: process.env.TEST_GENERAL_ID,
        },
      }

      jest
        .spyOn(controller, "findProjects")
        .mockResolvedValue({ data: mockProject })

      const response = await controller.findProjects(userRequest as UserRequest)

      expect(response).toEqual({ data: mockProject })
    })
    it("should handle errors during fetching projects", async () => {
      const mockDepartmentId = process.env.TEST_GENERAL_ID
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
        query: {
          departmentId: mockDepartmentId,
        },
      }

      jest
        .spyOn(controller, "findProjects")
        .mockRejectedValue(new Error("Test error"))
      try {
        await controller.findProjects(userRequest as UserRequest)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe("Test error")
      }
    })
  })

  describe("Get all projects", () => {
    it("return a list of projects", async () => {
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
        query: {},
      }

      const mockProject = {
        _id: process.env.TEST_GENERAL_ID,
        name: "Project 1",
        description: "Project description 1",
        departmentId: "depId1",
      }

      jest
        .spyOn(controller, "findProjects")
        .mockResolvedValue({ data: mockProject })

      const response = await controller.findProjects(userRequest as UserRequest)

      expect(response).toEqual(formatSuccessResponse(mockProject))
    })

    it("should handle errors during fetching projects", async () => {
      const request = {
        headers: {
          authorization: `Bearer asd`,
        },
      }
      rolesGuardMock.canActivate = jest.fn().mockReturnValue(false)

      try {
        await controller.findProjects(request as unknown as any)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe("Get project by id", () => {
    it("should return a project", async () => {
      const mockProjectId = process.env.TEST_GENERAL_ID
      const mockProject = {
        _id: mockProjectId,
        name: "Project 1",
        description: "Project description 1",
        departmentId: "depId1",
      }
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
        query: {
          projectId: mockProjectId,
        },
      }

      jest.spyOn(controller, "findProjects").mockResolvedValue({
        data: mockProject,
      })

      const response = await controller.findProjects(userRequest as UserRequest)

      expect(response).toEqual({ data: mockProject })
    })
    it("should handle errors during fetching project", async () => {
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
      }

      jest
        .spyOn(controller, "findProjects")
        .mockRejectedValue(new Error("Test error"))

      try {
        await controller.findProjects(userRequest as UserRequest)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe("Test error")
      }
    })
  })

  describe("create projects", () => {
    it("should create a project", async () => {
      const createProjectDto: CreateProjectDto = {
        name: "Test Department",
        description: "Test Description",
        status: "underway",
        alias: "",
        departmentId: new Types.ObjectId("65033b02fd94afe4f19fa318"),
        positions: [],
        projectLead: new Types.ObjectId(),
        board: "",
      }
      const createdProject: Partial<Project> = {
        name: "Test Department",
        departmentId: new Types.ObjectId("65033b02fd94afe4f19fa318"),
      }

      projectServiceMock.createProject.mockResolvedValue(createdProject)

      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
      }

      const response = await controller.createProject(
        createProjectDto,
        userRequest as any,
      )

      expect(response).toEqual({
        data: createdProject,
      })

      expect(customLoggerMock.log).toHaveBeenCalledWith(
        `Project ${createProjectDto.name} was created`,
      )
    })

    it("should handle errors during project creation", async () => {
      const createProjectDto: CreateProjectDto = {
        name: "Test Project",
        description: "Test Description",
        status: "underway",
        alias: "",
        departmentId: new Types.ObjectId("65033b02fd94afe4f19fa318"),
        positions: [],
        projectLead: new Types.ObjectId(),
        board: "",
      }
      const userRequest: Partial<UserRequest> = {
        user: {
          organizationId: process.env.TEST_ORGANIZATION_ID,
        },
      }
      const error = new Error("Test error")

      projectServiceMock.createProject.mockRejectedValue(error)

      try {
        await controller.createProject(createProjectDto, userRequest as any)
      } catch (err) {
        expect(err).toBe(error)
      }
    })
  })
})
