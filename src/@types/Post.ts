import { Types } from "mongoose"

export interface Post {
  content: string
  title: string
  kudos: number
  mediaUrl: string[]
  creatorId: Types.ObjectId
}
