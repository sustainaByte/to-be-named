import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { Project as ProjectType } from "src/@types/index"
import { ProjectStatus } from "src/@types"

@Schema()
export class Project extends Document implements ProjectType {
  @Prop({ required: true })
  name: string

  @Prop()
  alias: string

  @Prop()
  description: string

  @Prop({ type: [{ type: Types.ObjectId, ref: "Position" }] })
  positions: Types.ObjectId[]

  @Prop({
    type: Types.ObjectId,
    ref: "Department",
    required: true,
  })
  departmentId: Types.ObjectId

  @Prop({
    type: Types.ObjectId,
    ref: "User",
  })
  projectLead: Types.ObjectId

  @Prop({ required: true, enum: ProjectStatus })
  status: string

  @Prop()
  board: string
}

export const ProjectSchema = SchemaFactory.createForClass(Project)

ProjectSchema.index({ name: 1, departmentId: 1 }, { unique: true })
