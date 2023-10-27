import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

import { Organization as OrganizationType } from "src/@types/index"

@Schema()
export class Organization extends Document implements OrganizationType {
  @Prop({ required: true })
  companyName: string

  @Prop({ required: true })
  employeesNo: number

  @Prop({ required: true })
  phoneNumber: string
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization)
