import { Injectable } from "@nestjs/common"

import { Department } from "src/db/schemas/index"
import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"

@Injectable()
export class DepartmentRepository extends BaseRepository<Department> {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
  ) {
    super(departmentModel)
  }
}
