import { Injectable, NestMiddleware } from "@nestjs/common"
import { NextFunction, Response } from "express"

import { UserRequest } from "src/@types/index"
import { UNAUTHORIZED_EXCEPTION } from "src/constants/index"
import { AuthService } from "src/services/index"

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1]
      const decodedToken = await this.authService.verifyToken(token)
      req.user = decodedToken
      next()
    } catch (error) {
      res.status(401).json({ message: UNAUTHORIZED_EXCEPTION })
    }
  }
}
