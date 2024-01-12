/* eslint-disable prettier/prettier */
import { PostRepository } from "./PostRepository"
import { RoleRepository } from "./RoleRepository"
import { UserRepository } from "./UserRepository"
import { EventRepository } from "./EventRepository"
import { StatisticsRepository } from "./StatisticsRepository"

export const repositories = [
  RoleRepository,
  UserRepository,
  PostRepository,
  EventRepository,
  StatisticsRepository
]

export { RoleRepository, UserRepository, PostRepository, EventRepository, StatisticsRepository }
