import { Injectable } from "@nestjs/common"

import { User } from "src/db/schemas/index"

import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel)
  }
}
