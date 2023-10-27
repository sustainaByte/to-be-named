import { Types } from "mongoose"

export interface Project {
  name: string
  description: string
  departmentId: Types.ObjectId
}
