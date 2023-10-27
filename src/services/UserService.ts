import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

import {
  REFRESH_TOKEN_EXP,
} from "src/constants"
import {
  CreateOrganizationDto,
} from "src/dto"
import { User } from "src/db/schemas"
import {
  formatErrorResponse,
} from "src/utils"
import { JwtPayload, UserRole } from "src/@types"
import {
  OrganizationRepository,
  RoleRepository,
  UserRepository,
} from "src/repositories"

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async registerUser(
    registerUserDto: RegisterUserDto,
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
        ...registerUserDto,
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
      const user = (await this.userRepository.findOne({ email }, ["-__v"])) as User

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new BadRequestException("Invalid credentials")
      }

      const payload: JwtPayload = {
        userId: user._id,
        email: user.email,
        roles: user.roles,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
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
}
