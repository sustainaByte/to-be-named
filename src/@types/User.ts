import { Types } from "mongoose"
export interface User {
  name: string
  surname: string
  email: string
  password: string
  phoneNumber: string
  roles: Types.ObjectId[]
}
