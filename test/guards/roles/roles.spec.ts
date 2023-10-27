import { Test, TestingModule } from "@nestjs/testing"
import { RolesGuard } from "src/guards/RolesGuard"
import { Reflector } from "@nestjs/core"
import { Model } from "mongoose"
import { ForbiddenException } from "@nestjs/common"
import * as jwt from "jsonwebtoken"
import * as dotenv from "dotenv"

import { Role } from "src/db/schemas"
import { UserRole } from "src/@types/index"
import { AuthService } from "src/services"
import { RoleRepository } from "src/repositories"

dotenv.config()

describe("RolesGuard", () => {
  let rolesGuard: RolesGuard
  let reflector: Reflector
  let roleModel: Model<Role>
  let authService: AuthService
  let roleRepository: RoleRepository

  //Make sure to add proper roles to the token

  const tokenWithAdmin = jwt.sign(
    {
      roles: [process.env.TEST_ADMIN_ROLE_ID],
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.RESET_JWT_TOKEN_EXPIRE },
  )
  const tokenStandardUser = jwt.sign(
    {
      roles: [process.env.TEST_STANDARD_ROLE_ID],
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.RESET_JWT_TOKEN_EXPIRE },
  )

  const roleRepositoryMock = {
    find: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            verifyToken: jest.fn().mockReturnValue({ roles: [] }),
          },
        },
        {
          provide: RoleRepository,
          useValue: roleRepositoryMock,
        },
      ],
    }).compile()

    rolesGuard = module.get<RolesGuard>(RolesGuard)
    reflector = module.get<Reflector>(Reflector)
    authService = module.get<AuthService>(AuthService)
  })

  it("should be defined", () => {
    expect(rolesGuard).toBeDefined()
  })

  describe("canActivate", () => {
    it("should return true if no roles are required", async () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: `${tokenStandardUser}`,
          },
        }),
      }
      const mockReflector = {
        getAllAndOverride: jest.fn().mockReturnValue(undefined),
      }

      reflector.getAllAndOverride = mockReflector.getAllAndOverride

      const result = await rolesGuard.canActivate(mockContext as any)
      expect(result).toBe(true)
    })

    it("should return true if user has required roles", async () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: `Bearer ${tokenWithAdmin}`,
          },
        }),
      }

      const mockReflector = {
        getAllAndOverride: jest.fn().mockReturnValue([
          {
            name: UserRole.ADMIN,
            priority: 1,
          },
        ]),
      }

      roleRepositoryMock.find.mockResolvedValue([
        { name: UserRole.ADMIN, priority: 1 },
      ])

      reflector.getAllAndOverride = mockReflector.getAllAndOverride
      const result = await rolesGuard.canActivate(mockContext as any)
      expect(result).toBe(true)
    })

    it("should throw ForbiddenException if user does not have required roles", async () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: `Bearer ${tokenStandardUser}`,
          },
        }),
      }
      const mockReflector = {
        getAllAndOverride: jest.fn().mockReturnValue([
          {
            name: UserRole.ADMIN,
            priority: 1,
          },
        ]),
      }

      roleRepositoryMock.find.mockResolvedValue([
        { name: UserRole.STANDARD_USER, priority: 4 },
      ])

      reflector.getAllAndOverride = mockReflector.getAllAndOverride
      await expect(
        rolesGuard.canActivate(mockContext as any),
      ).rejects.toThrowError(ForbiddenException)
    })
  })
})
