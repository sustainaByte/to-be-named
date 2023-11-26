import { PostRepository } from "./PostRepository"
import { RoleRepository } from "./RoleRepository"
import { UserRepository } from "./UserRepository"

export const repositories = [RoleRepository, UserRepository, PostRepository]

export { RoleRepository, UserRepository, PostRepository }
