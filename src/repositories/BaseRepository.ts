import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common"
import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  PipelineStage,
  Types,
} from "mongoose"

import { Repository } from "../@types"
import { formatErrorResponse, formatSelectedFields } from "src/utils"
import { CONFLICT_EXCEPTION } from "src/constants"

export abstract class BaseRepository<T extends Document>
  implements Repository<T>
{
  constructor(private readonly model: Model<T>) {}

  async find(
    filter: FilterQuery<T>,
    selectedFields?: string[],
  ): Promise<T[] | T> {
    try {
      let query = this.model.find(filter)

      if (selectedFields) {
        const filteredFields = formatSelectedFields(selectedFields)
        query = query.select(filteredFields)
      }

      const result = await query.exec()
      return result
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async findOne(
    filter: FilterQuery<T>,
    selectedFields?: string[],
  ): Promise<T | null> {
    try {
      let query = this.model.findOne(filter)

      if (selectedFields) {
        const filteredFields = formatSelectedFields(selectedFields)
        query = query.select(filteredFields)
      }

      const result = await query.exec()
      return result
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async findById(id: string, selectedFields?: string[]): Promise<T | null> {
    try {
      let query = this.model.findById(id)

      if (selectedFields) {
        const filteredFields = formatSelectedFields(selectedFields)
        query = query.select(filteredFields)
      }

      const result = await query.exec()
      return result
    } catch (error) {
      throw new NotFoundException(formatErrorResponse(error))
    }
  }

  async create(createDto: any): Promise<T> {
    try {
      const newItem = new this.model(createDto)
      return (await newItem.save()) as T
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          formatErrorResponse({ message: CONFLICT_EXCEPTION }),
        )
      }
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async update(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    selectedFields?: string[],
  ): Promise<T | null> {
    try {
      let query = this.model.findOneAndUpdate(filter, updateDto, { new: true })

      if (selectedFields) {
        const filteredFields = formatSelectedFields(selectedFields)
        query = query.select(filteredFields)
      }

      const result = await query.exec()
      return result
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

    async delete(id: string): Promise<T | null> {
    try {
      //return await this.model.findByIdAndDelete(id).exec()
        return null;
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
    }

  async findAdvanced(filter: PipelineStage[]): Promise<T | T[]> {
    try {
      return await this.model.aggregate(filter).exec()
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec()
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    try {
      if (id instanceof Types.ObjectId) return id
      else return new Types.ObjectId(id)
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
