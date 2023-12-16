import { Injectable } from "@nestjs/common"

import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"
import { Event } from "src/db/schemas"

@Injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {
    super(eventModel)
  }
}
