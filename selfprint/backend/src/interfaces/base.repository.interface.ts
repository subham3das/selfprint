import mongoose from 'mongoose';
import { PaginationParams } from '../utils/pagination';
import { PaginationMeta } from '../responses/ApiResponse';

export type QueryFilter<T = any> = Record<string, any> & Partial<T>;
export type QueryUpdate<T = any> = Record<string, any> & Partial<T>;

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  createMany(data: Partial<T>[]): Promise<T[]>;
  findById(
    id: string,
    projection?: any,
    options?: mongoose.QueryOptions
  ): Promise<T | null>;
  findOne(
    filter: QueryFilter<T>,
    projection?: any,
    options?: mongoose.QueryOptions
  ): Promise<T | null>;
  find(
    filter?: QueryFilter<T>,
    projection?: any,
    options?: mongoose.QueryOptions
  ): Promise<T[]>;
  findWithPagination(
    filter?: QueryFilter<T>,
    pagination?: PaginationParams,
    projection?: any,
    sort?: any
  ): Promise<PaginatedResult<T>>;
  updateById(
    id: string,
    update: QueryUpdate<T>,
    options?: mongoose.QueryOptions
  ): Promise<T | null>;
  updateOne(
    filter: QueryFilter<T>,
    update: QueryUpdate<T>,
    options?: mongoose.QueryOptions
  ): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
  deleteMany(filter: QueryFilter<T>): Promise<number>;
  count(filter?: QueryFilter<T>): Promise<number>;
  exists(filter: QueryFilter<T>): Promise<boolean>;
}
