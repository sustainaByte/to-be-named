import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

import { REFRESH_TOKEN_EXP } from "src/constants"
import { LoginUserDto, RegisterUserDto } from "src/dto"
import { User } from "src/db/schemas"
import { formatErrorResponse } from "src/utils"
import { JwtPayload, UserRole } from "src/@types"
import { RoleRepository, UserRepository } from "src/repositories"

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10)

    try {
      const standardRole = await this.roleRepository.find({
        name: UserRole.STANDARD_USER,
      })
  
      const createdUser = await this.userRepository.create({
        ...registerUserDto,
        password: hashedPassword,
        roles: [standardRole[0]._id],
      })

      return createdUser
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(formatErrorResponse(error))
      }
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<object> {
    try {
      const user = (await this.userRepository.findOne({
        email: loginUserDto.email,
      })) as User

      if (
        !user ||
        !(await bcrypt.compare(loginUserDto.password, user.password))
      ) {
        throw new BadRequestException("Invalid credentials")
      }

      const payload: JwtPayload = {
        userId: user._id,
        email: user.email,
        roles: user.roles.toString().split(","),
      }

      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      })

      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      })

      return { jwtToken, refreshToken, expiresIn: REFRESH_TOKEN_EXP }
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
