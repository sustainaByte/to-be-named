import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { Position as PositionType } from "src/@types/index"

@Schema()
export class Position extends Document implements PositionType {
  @Prop({ required: true, unique: true })
  name: string

  @Prop({ required: true, type: Types.ObjectId, ref: "Organization" })
  organizationId: Types.ObjectId
}

export const PositionSchema = SchemaFactory.createForClass(Position)
