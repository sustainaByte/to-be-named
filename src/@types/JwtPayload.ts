import { UserRole } from "./UserRole"

export interface JwtPayload {
  userId: string
  roles: UserRole[]
  email: string
  organizationId: string
  departmentId: string
}
