import { UpdateQuery, FilterQuery, PipelineStage } from "mongoose"

export interface Repository<T> {
  findById(id: string): Promise<T | null>
  findOne(filter: FilterQuery<T>, selectedFields?: string[]): Promise<T | null>
  create(createDto): Promise<T>
  update(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    selectedFields?: string[],
  ): Promise<T | null>
  delete(id: string): Promise<T | null>
  find(filter: FilterQuery<T>, selectedFields?: string[]): Promise<T[] | T>
  findAdvanced(filter: PipelineStage[]): Promise<T[] | T>
}
