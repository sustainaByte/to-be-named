import { DepartmentRepository } from "./DepartmentRepository"
import { OrganizationRepository } from "./OrganizationRepository"
import { PositionRepository } from "./PositionRepository"
import { ProjectRepository } from "./ProjectRepository"
import { RoleRepository } from "./RoleRepository"
import { UserRepository } from "./UserRepository"

export const repositories = [
  RoleRepository,
  DepartmentRepository,
  OrganizationRepository,
  PositionRepository,
  ProjectRepository,
  UserRepository,
]

export {
  RoleRepository,
  DepartmentRepository,
  OrganizationRepository,
  PositionRepository,
  ProjectRepository,
  UserRepository,
}
