export interface UserRoleDefinition {
  name: UserRole
  priority: number
}

export enum UserRole {
  STANDARD_USER = "standard_user",
  PREMIUM = "premium",
  ADMIN = "admin"
}

export const USER_ROLE_DEFINITIONS: UserRoleDefinition[] = [
  { name: UserRole.PREMIUM, priority: 1 },
    { name: UserRole.STANDARD_USER, priority: 2 },
    { name: UserRole.ADMIN, priority: 3 },
]
