import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { Types } from "mongoose"

import { PositionController } from "src/controllers"
import { PositionRepository } from "src/repositories"
import { CustomLogger, formatSuccessResponse } from "src/utils"
import { UserRole, UserRequest } from "src/@types"
import { Position, Role } from "src/db/schemas"
import { Position as PositionType } from "src/@types"
import { AuthService, PositionService } from "src/services"
import { CONFLICT_EXCEPTION } from "src/constants"
import { RolesGuard } from "src/guards/RolesGuard"
import { ForbiddenException } from "@nestjs/common"
import { UpdatePositionDto } from "src/dto"

const positionRepositoryMock = {
  find: jest.fn(),
  create: jest.fn(),
  toObjectId: jest.fn(),
}

const positionServiceMock = {
  editPosition: jest.fn(),
}

const customLoggerMock = {
  log: jest.fn(),
  error: jest.fn(),
}

const rolesGuardMock = {
  canActivate: jest.fn().mockReturnValue(true),

  denyAccess: () => {
    rolesGuardMock.canActivate.mockReturnValue(false)
  },
}

describe("PositionController", () => {
  let controller: PositionController
  let positionRepository: PositionRepository
  let customLogger: CustomLogger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionController],
      providers: [
        {
          provide: PositionRepository,
          useValue: positionRepositoryMock,
        },
        {
          provide: PositionService,
          useValue: positionServiceMock,
        },
        {
          provide: CustomLogger,
          useValue: customLoggerMock,
        },
        {
          provide: getModelToken(Position.name),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
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

    controller = module.get<PositionController>(PositionController)
    positionRepository = module.get<PositionRepository>(PositionRepository)
    customLogger = module.get<CustomLogger>(CustomLogger)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("findAll", () => {
    it("should return all positions", async () => {
      const organizationId = new Types.ObjectId()
      const user: UserRequest = {
        user: {
          email: "",
          organizationId: organizationId.toHexString(),
          roles: [UserRole.ADMIN],
        },
      } as UserRequest

      const positions: PositionType[] = [
        {
          name: "position1",
          organizationId: organizationId,
        },
        {
          name: "position2",
          organizationId: organizationId,
        },
      ]

      positionRepositoryMock.find.mockResolvedValue(positions)
      positionRepositoryMock.toObjectId.mockReturnValue(organizationId)

      const response = await controller.findAllPositions(user)

      expect(response).toEqual(formatSuccessResponse(positions))

      expect(customLogger.log).toHaveBeenCalledWith(
        `User ${user.user.email} retrieved all positions`,
      )
    })
    it("should throw ForbiddenException if user doesn't have access", async () => {
      const organizationId = new Types.ObjectId()
      const user: UserRequest = {
        user: {
          email: "",
          organizationId: organizationId.toHexString(),
          roles: [UserRole.ADMIN],
        },
      } as UserRequest

      const positions: PositionType[] = [
        {
          name: "position1",
          organizationId: organizationId,
        },
        {
          name: "position2",
          organizationId: organizationId,
        },
      ]

      positionRepositoryMock.find.mockResolvedValue(positions)

      rolesGuardMock.denyAccess()

      try {
        await controller.findAllPositions(user)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException)
        expect(error.message).toContain("Forbidden")
      }
    })
  })

  describe("create", () => {
    it("should create a position", async () => {
      const organizationId = new Types.ObjectId()
      const user: UserRequest = {
        user: {
          email: "",
          organizationId: organizationId.toHexString(),
          roles: [UserRole.ADMIN],
        },
      } as UserRequest

      const position: PositionType = {
        name: "position1",
        organizationId: organizationId,
      }

      jest
        .spyOn(controller, "createPosition")
        .mockResolvedValue({ data: position })

      const response = await controller.createPosition(user, position)

      expect(response).toEqual(formatSuccessResponse(position))
    })
  })
  it("should throw an error if the position already exists", async () => {
    const organizationId = new Types.ObjectId()
    const user: UserRequest = {
      user: {
        email: "",
        organizationId: organizationId.toHexString(),
        roles: [UserRole.ADMIN],
      },
    } as UserRequest

    const position: PositionType = {
      name: "position1",
      organizationId: organizationId,
    }

    jest
      .spyOn(controller, "createPosition")
      .mockRejectedValue({ message: CONFLICT_EXCEPTION })

    try {
      await controller.createPosition(user, position)
    } catch (error) {
      expect(error.message).toEqual(CONFLICT_EXCEPTION)
    }
  })
  it("update a position", async () => {
    const updatePositionDto: UpdatePositionDto = {
      name: "string",
    }

    const userRequest: Partial<UserRequest> = {
      user: {
        organizationId: process.env.TEST_ORGANIZATION_ID,
      },
    }

    const positionId = "123456789"

    const updatedPositionMock = {
      _id: "64f816e76ecbee03604aa92b",
      name: "nodejs",
      organizationId: "asd",
    }

    positionServiceMock.editPosition.mockResolvedValue(updatedPositionMock)

    const response = await controller.updatePosition(
      positionId,
      updatePositionDto,
      userRequest as any,
    )

    expect(response).toEqual({ data: updatedPositionMock })
    expect(positionServiceMock.editPosition).toHaveBeenCalledWith(
      positionId,
      updatePositionDto,
      userRequest.user.organizationId,
    )
  })
  it("should throw ForbiddenException if user doesn't have access", async () => {
    const organizationId = new Types.ObjectId()
    const user: UserRequest = {
      user: {
        email: "",
        organizationId: organizationId.toHexString(),
        roles: [UserRole.ADMIN],
      },
    } as UserRequest

    const position: PositionType = {
      name: "position1",
      organizationId: organizationId,
    }

    jest
      .spyOn(controller, "createPosition")
      .mockResolvedValue({ data: position })

    rolesGuardMock.denyAccess()

    try {
      await controller.createPosition(user, position)
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException)
      expect(error.message).toContain("Forbidden")
    }
  })
})
