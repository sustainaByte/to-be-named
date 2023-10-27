import { Injectable } from "@nestjs/common"

import { Organization } from "src/db/schemas/index"
import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"

@Injectable()
export class OrganizationRepository extends BaseRepository<Organization> {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<Organization>,
  ) {
    super(organizationModel)
  }
}
