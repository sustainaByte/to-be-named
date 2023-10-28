import { JwtPayload } from "src/@types"
import * as jwt from "jsonwebtoken"

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const decodedToken = (await jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
    )) as JwtPayload
    return decodedToken
  } catch (error) {
    return null
  }
}
