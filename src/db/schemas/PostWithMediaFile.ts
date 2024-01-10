import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

import { Post as PostType } from "src/@types/index"

@Schema({ timestamps: true })
export class PostWithMediaFile extends Document implements PostType {
    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    content: string

    @Prop({ default: [] })
    kudos: string[]

    @Prop([String])
    mediaUrl: string[]

    @Prop([])
    mediaFile: Express.Multer.File

    @Prop({ required: true })
    creatorId: Types.ObjectId
}

export const PostSchema = SchemaFactory.createForClass(PostWithMediaFile)
