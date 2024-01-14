/* eslint-disable prettier/prettier */
import { Optional } from "@nestjs/common"
import { Types } from "mongoose"

export interface Post {
    content: string
    title: string
    kudos: string[]
    mediaUrl: string[]
    creatorId: Types.ObjectId
    mediaFile?: Express.Multer.File
    location?: string
    comments?: [string, string][]
}
