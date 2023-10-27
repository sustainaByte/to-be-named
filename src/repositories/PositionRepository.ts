import { Injectable } from "@nestjs/common"

import { Position } from "src/db/schemas/index"
import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"

@Injectable()
export class PositionRepository extends BaseRepository<Position> {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,
  ) {
    super(positionModel)
  }
}
