import { BadRequestException, NotFoundException } from "@nestjs/common"
import * as jwt from "jsonwebtoken"
import axios from "axios"

import { REFRESH_TOKEN_EXP } from "src/constants/token"
import { UserRepository } from "src/repositories"
import { JwtPayload } from "src/@types"
import { formatErrorResponse } from "src/utils"

export class GoogleService {
  constructor(private readonly userRepository: UserRepository) {}

  async verify(token) {
    try {
      const BASE_API = "https://www.googleapis.com/oauth2/v1/tokeninfo"

      const response = await axios.get(`${BASE_API}?access_token=${token}`)
      const data = response.data

      const user = await this.userRepository.find({ email: data.email })
      if (!user) {
        throw new NotFoundException("User not found")
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
      if (error instanceof NotFoundException)
        throw new NotFoundException(formatErrorResponse(error))
      else throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async googleLogin(req) {
    if (!req.user) {
      return "No user from google"
    }
    const userEmail = req.user
    return {
      accessToken: userEmail.accessToken,
    }
  }
}
