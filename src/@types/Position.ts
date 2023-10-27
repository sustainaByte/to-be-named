import { Types } from "mongoose"

export interface Position {
  name: string
  organizationId: Types.ObjectId
}
