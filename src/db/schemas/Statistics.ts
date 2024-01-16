/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { Post as PostType } from "src/@types/index"

@Schema({ timestamps: true })
export class Statistics extends Document{
    @Prop({ required: true })
    Locations: Map<string,number>

}

export const StatisticsSchema = SchemaFactory.createForClass(Statistics)
