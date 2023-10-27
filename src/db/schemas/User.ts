import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { User as UserType } from "src/@types/index"

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

  @Prop({ type: [{ type: Types.ObjectId, ref: "Role" }], required: true })
  roles: Types.ObjectId[]
}

export const UserSchema = SchemaFactory.createForClass(User)
