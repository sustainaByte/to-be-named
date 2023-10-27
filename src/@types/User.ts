import { Types } from "mongoose"

export interface User {
  password: string
  email: string
  roles: Types.ObjectId[]
  organizationId: Types.ObjectId
}
