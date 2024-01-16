/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from "@nestjs/common"
import { Types } from "mongoose"
import { JwtPayload } from "src/@types"
import { Post } from "src/db/schemas"

import { CreatePostDto } from "src/dto"
import { PostRepository } from "src/repositories"
import { formatErrorResponse } from "src/utils"
import { PostWithMediaFile } from "../db/schemas/PostWithMediaFile"
import { Statistics } from "../db/schemas/Statistics"
import { StatisticsDto } from "../dto/StatisticsDto"
import { StatisticsRepository } from "../repositories/StatisticsRepository"
import { PostService } from "./PostService"
import { UploadService } from "./UploadService"

@Injectable()
export class StatisticsService {
    constructor(
        private readonly postService: PostService,
        private readonly statisticsRepo: StatisticsRepository,
    ) { }

    async createStatistics() {
        
        try {  
            const locationMap: Map<string, number> = new Map();
            const statistics: StatisticsDto = new StatisticsDto();
            const posts = this.postService.getAllPosts();
            (await posts).forEach((post, index) => {
                
                if (locationMap.has(post.location) && post.location != undefined) {
                    locationMap.set(post.location, locationMap.get(post.location) + 1)
                }
                else if (post.location != undefined) {
                    locationMap.set(post.location, 1);
                }
            })
            statistics.Locations = locationMap;
            const id = new Types.ObjectId("aabbccddeeff").toString()
            const stat = (await this.statisticsRepo.findById(
                id
            ))
            if (!stat) {
                await this.statisticsRepo.create({
                    _id: id,
                    ...statistics
                });
            }
            await this.statisticsRepo.update({
                 _id: this.statisticsRepo.toObjectId("aabbccddeeff") },
                statistics
            );
            return stat;
        }
        catch (error) {
            console.error(error);
            throw new BadRequestException(formatErrorResponse(error))
        }
    }

    async getStatistics() {
        try {
            
            const statistics = (await this.statisticsRepo.findById(
                new Types.ObjectId("aabbccddeeff").toString()
            ))
            
            return statistics
        } catch (error) {
            throw new BadRequestException(formatErrorResponse(error))
        }
    }
}


