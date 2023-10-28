import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

import { Role as RoleType } from "src/@types/index"

@Schema()
export class Role extends Document implements RoleType {
  @Prop({ required: true })
  name: string

  @Prop()
  description: string

  @Prop({ required: true })
  priority: number
}

export const RoleSchema = SchemaFactory.createForClass(Role)
