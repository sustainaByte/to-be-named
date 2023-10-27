import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { EmploymentType, User as UserType } from "src/@types/index"

@Schema()
export class User extends Document implements UserType {
  @Prop()
  name: string

  @Prop()
  surname: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  phoneNumber: string

  @Prop()
  emergencyNumber: string

  @Prop({
    type: Schema,
    schema: {
      city: String,
      country: String,
      street: String,
      streetNumber: String,
    },
  })
  address: {
    city: string
    country: string
    street: string
    streetNumber: string
  }

  @Prop({ type: [{ type: Types.ObjectId, ref: "Role" }], required: true })
  roles: Types.ObjectId[]

  @Prop({
    type: Types.ObjectId,
    ref: "Organization",
    required: true,
  })
  organizationId: Types.ObjectId

  @Prop({
    type: Schema,
    schema: {
      projectId: { type: Types.ObjectId, ref: "Project" },
      positionId: { type: Types.ObjectId, ref: "Position" },
    },
  })
  projects: { projectId: Types.ObjectId; positionId: Types.ObjectId }[]

  @Prop({ enum: EmploymentType, default: 8 })
  employmentType: number

  @Prop({
    type: Schema,
    schema: {
      startTime: { type: Number },
      endTime: { type: Number },
      loggedHours: { type: Number },
      additionalNotes: { type: String },
    },
  })
  timesheets: {
    startTime: number
    endTime: number
    loggedHours: number
    additionalNotes?: string
  }[]
}

export const UserSchema = SchemaFactory.createForClass(User)
