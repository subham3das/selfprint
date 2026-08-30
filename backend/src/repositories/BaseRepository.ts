import mongoose from 'mongoose';
import {
  IBaseRepository,
  PaginatedResult,
  QueryFilter,
  QueryUpdate
} from '../interfaces/base.repository.interface';
import { PaginationParams, getPaginationParams, buildPaginationMeta } from '../utils/pagination';

/**
 * Abstract Generic Base Repository for Mongoose ODM
 * Handles standard CRUD operations, pagination, sorting, and error boundaries
 */
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected readonly model: mongoose.Model<T>;

  constructor(model: mongoose.Model<T>) {
    this.model = model;
  }

  public async create(data: Partial<T>): Promise<T> {
    const created = await this.model.create(data);
    return created.toObject ? created.toObject() : (created as unknown as T);
  }

  public async createMany(data: Partial<T>[]): Promise<T[]> {
    const created = await this.model.insertMany(data);
    return created.map((item: any) =>
      item.toObject ? item.toObject() : (item as T)
    );
  }

  public async findById(
    id: string,
    projection?: any,
    options?: mongoose.QueryOptions
  ): Promise<T | null> {
    return this.model.findById(id, projection, options).lean().exec() as Promise<T | null>;
  }

  public async findOne(
    filter: QueryFilter<T>,
    projection?: any,
    options?: mongoose.QueryOptions
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).lean().exec() as Promise<T | null>;
  }

  public async find(
    filter: QueryFilter<T> = {},
    projection?: any,
    options?: mongoose.QueryOptions
  ): Promise<T[]> {
    return this.model.find(filter, projection, options).lean().exec() as Promise<T[]>;
  }

  public async findWithPagination(
    filter: QueryFilter<T> = {},
    paginationParams: PaginationParams = {},
    projection?: any,
    sort: any = { createdAt: -1 }
  ): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = getPaginationParams(paginationParams);

    const [items, totalItems] = await Promise.all([
      this.model
        .find(filter, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec() as Promise<T[]>,
      this.model.countDocuments(filter).exec()
    ]);

    return {
      items,
      pagination: buildPaginationMeta(totalItems, page, limit)
    };
  }

  public async updateById(
    id: string,
    update: QueryUpdate<T>,
    options: mongoose.QueryOptions = { new: true, runValidators: true }
  ): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, options)
      .lean()
      .exec() as Promise<T | null>;
  }

  public async updateOne(
    filter: QueryFilter<T>,
    update: QueryUpdate<T>,
    options: mongoose.QueryOptions = { new: true, runValidators: true }
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, update, options)
      .lean()
      .exec() as Promise<T | null>;
  }

  public async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).lean().exec() as Promise<T | null>;
  }

  public async deleteMany(filter: QueryFilter<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount || 0;
  }

  public async count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  public async exists(filter: QueryFilter<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }
}

export default BaseRepository;
