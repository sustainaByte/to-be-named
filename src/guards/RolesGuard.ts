import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"

import { UserRole, UserRoleDefinition } from "src/@types/index"
import { formatErrorResponse } from "src/utils/index"
import { AuthService } from "src/services/index"
import {
  FORBIDDEN_EXCEPTION,
  UNAUTHORIZED_EXCEPTION,
} from "src/constants/index"
import { RoleRepository } from "src/repositories"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<
        UserRoleDefinition[]
      >("roles", [context.getHandler(), context.getClass()])
      if (!requiredRoles) {
        return true
      }
      const request = context.switchToHttp().getRequest()
      const token = request.headers.authorization?.split(" ")[1]
      const decodedToken = await this.authService.verifyToken(token)

      const userRoles = await this.roleRepository.find({
        _id: decodedToken.roles,
      })
      const userRolesName: UserRole[] = ([] as UserRole[]).concat(
        ...(Array.isArray(userRoles) ? userRoles : [userRoles]).map(
          (role: any) => role.name as UserRole,
        ),
      )
      const userRolesPriority: number[] = ([] as number[]).concat(
        ...(Array.isArray(userRoles) ? userRoles : [userRoles]).map(
          (role: any) => role.priority,
        ),
      )
      if (
        userRolesName.some((userRole) =>
          requiredRoles.some((requiredRole) => requiredRole.name === userRole),
        ) ||
        userRolesPriority.some((userPriority) =>
          requiredRoles.some(
            (requiredRole) => userPriority <= requiredRole.priority,
          ),
        )
      ) {
        return true
      } else {
        throw new ForbiddenException(FORBIDDEN_EXCEPTION)
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(formatErrorResponse(error))
      } else {
        throw new UnauthorizedException(
          formatErrorResponse({ message: UNAUTHORIZED_EXCEPTION }),
        )
      }
    }
  }
}
