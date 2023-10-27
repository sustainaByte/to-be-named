import { Injectable } from "@nestjs/common"

import { Project } from "src/db/schemas/index"
import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {
    super(projectModel)
  }
}
