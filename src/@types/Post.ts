import { Types } from "mongoose"

export interface Post {
  content: string
  title: string
  kudos: number
  mediaUrl: Buffer[]
  creatorId: Types.ObjectId
}
