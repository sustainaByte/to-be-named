import { Types } from "mongoose"

export interface Department {
  name: string
  description: string
  depLeadId: Types.ObjectId
  organizationId: Types.ObjectId
}
