import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { User as UserType } from "src/@types/index"
import { AddressDto } from "src/dto"

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

  @Prop({ default: 0 })
  ecoPoints: number

  @Prop({ required: true })
  phoneNumber: string

  @Prop({ required: true })
  address: AddressDto

  @Prop({ type: [{ type: Types.ObjectId, ref: "Role" }], required: true })
  roles: Types.ObjectId[]
}

export const UserSchema = SchemaFactory.createForClass(User)
