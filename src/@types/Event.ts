import { Types } from "mongoose"

export interface Event {
  title: string
  content: string
  kudos: string[]
  mediaUrl: Buffer[]
  creatorId: Types.ObjectId
  requiredMoney: number
  collectedMoney: number
  volunteers: Types.ObjectId[]
}
