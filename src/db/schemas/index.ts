import { Role, RoleSchema } from "./Role"
import { User, UserSchema } from "./User"

export const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Role.name, schema: RoleSchema },
]

export { User, UserSchema, Role, RoleSchema }
