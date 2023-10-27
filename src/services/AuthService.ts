import { Injectable } from "@nestjs/common"
import * as jwt from "jsonwebtoken"

import { JwtPayload } from "src/@types/index"

@Injectable()
export class AuthService {
  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
      ) as JwtPayload
      return decodedToken
    } catch (error) {
      return null
    }
  }
}
