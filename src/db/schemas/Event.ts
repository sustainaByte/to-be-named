import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { Event as EventType } from "src/@types/index"

@Schema({ timestamps: true })
export class Event extends Document implements EventType {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  content: string

  @Prop({ default: [] })
  kudos: string[]

  //TODO: Encode/Decode
  @Prop([Buffer])
  mediaUrl: Buffer[]

  @Prop({ required: true })
  creatorId: Types.ObjectId

  @Prop({ required: false, default: 0 })
  requiredMoney: number

  @Prop({ required: false, default: 0 })
  collectedMoney: number

  @Prop({ required: false, default: [] })
  donors: { userId: Types.ObjectId; amount: number }[]

  @Prop({ required: false, default: [] })
  volunteers: Types.ObjectId[]
}

export const EventSchema = SchemaFactory.createForClass(Event)
