import { Department, DepartmentSchema } from "./Department"
import { Organization, OrganizationSchema } from "./Organization"
import { Position, PositionSchema } from "./Position"
import { Project, ProjectSchema } from "./Project"
import { Role, RoleSchema } from "./Role"
import { User, UserSchema } from "./User"

export const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Organization.name, schema: OrganizationSchema },
  { name: Role.name, schema: RoleSchema },
  { name: Department.name, schema: DepartmentSchema },
  { name: Project.name, schema: ProjectSchema },
  { name: Position.name, schema: PositionSchema },
]

export {
  User,
  UserSchema,
  Organization,
  OrganizationSchema,
  Role,
  RoleSchema,
  Department,
  DepartmentSchema,
  Project,
  ProjectSchema,
  Position,
  PositionSchema,
}
