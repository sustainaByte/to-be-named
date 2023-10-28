import { Injectable } from "@nestjs/common"

import { Role } from "src/db/schemas/index"

import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {
    super(roleModel)
  }
}
