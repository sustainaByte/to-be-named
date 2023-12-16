import { PostRepository } from "./PostRepository"
import { RoleRepository } from "./RoleRepository"
import { UserRepository } from "./UserRepository"
import { EventRepository } from "./EventRepository"

export const repositories = [
  RoleRepository,
  UserRepository,
  PostRepository,
  EventRepository,
]

export { RoleRepository, UserRepository, PostRepository, EventRepository }
