import { Injectable, NestMiddleware } from "@nestjs/common"
import { NextFunction, Response } from "express"

import { UserRequest } from "src/@types/index"
import { UNAUTHORIZED_EXCEPTION } from "src/constants/index"
import { verifyToken } from "src/utils/verifiyToken"

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1]
      const decodedToken = await verifyToken(token)
      req.user = decodedToken
      next()
    } catch (error) {
      res.status(401).json({ message: UNAUTHORIZED_EXCEPTION })
    }
  }
}
