export interface UserRoleDefinition {
  name: UserRole
  priority: number
}

export enum UserRole {
  ADMIN = "admin",
  STANDARD_USER = "standard_user",
  DEP_LEAD = "dep_lead",
  PROJECT_LEAD = "project_lead",
}

export const USER_ROLE_DEFINITIONS: UserRoleDefinition[] = [
  { name: UserRole.ADMIN, priority: 1 },
  { name: UserRole.DEP_LEAD, priority: 2 },
  { name: UserRole.PROJECT_LEAD, priority: 3 },
  { name: UserRole.STANDARD_USER, priority: 4 },
]
