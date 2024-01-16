/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common"

import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { BaseRepository } from "./BaseRepository"
import { Statistics } from "../db/schemas/Statistics"

@Injectable()
export class StatisticsRepository extends BaseRepository<Statistics> {
    constructor(@InjectModel(Statistics.name) private readonly statisticsModel: Model<Statistics>) {
        super(statisticsModel)
    }
}