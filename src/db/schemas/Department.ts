import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

@Schema()
export class Department extends Document {
  @Prop({ required: true, unique: true })
  name: string

  @Prop({ required: true })
  description: string

  @Prop({
    type: Types.ObjectId,
    ref: "User",
  })
  depLeadId: Types.ObjectId

  @Prop({
    type: Types.ObjectId,
    ref: "Organization",
    required: true,
  })
  organizationId: Types.ObjectId
}

export const DepartmentSchema = SchemaFactory.createForClass(Department)
