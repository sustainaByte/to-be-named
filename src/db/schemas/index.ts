import { Role, RoleSchema } from "./Role"
import { User, UserSchema } from "./User"
import { Post, PostSchema } from "./Post"
import { Event, EventSchema } from "./Event"

export const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Role.name, schema: RoleSchema },
  { name: Post.name, schema: PostSchema },
  { name: Event.name, schema: EventSchema },
]

export {
  User,
  UserSchema,
  Role,
  RoleSchema,
  Post,
  PostSchema,
  Event,
  EventSchema,
}
