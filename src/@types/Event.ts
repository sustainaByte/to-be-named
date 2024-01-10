import { Types } from "mongoose"

export interface Event {
  title: string
  content: string
  kudos: string[]
  mediaUrl: string[]
  creatorId: Types.ObjectId
  requiredMoney: number
  collectedMoney: number
  volunteers: Types.ObjectId[]
}
