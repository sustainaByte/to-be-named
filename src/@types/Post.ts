import { Types } from "mongoose"

export interface Post {
  content: string
  title: string
  kudos: string[]
  mediaUrl: Buffer[]
  creatorId: Types.ObjectId
}
