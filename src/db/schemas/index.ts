import { Role, RoleSchema } from "./Role"
import { User, UserSchema } from "./User"
import { Post, PostSchema } from "./Post"

export const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Role.name, schema: RoleSchema },
  { name: Post.name, schema: PostSchema },
]

export { User, UserSchema, Role, RoleSchema, Post, PostSchema }
