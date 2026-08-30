import { PaginationParams } from '../utils/pagination';
import { PaginatedResult } from './base.repository.interface';

export interface IBaseService<T> {
  create(data: Partial<T>): Promise<T>;
  getById(id: string): Promise<T>;
  getAll(filter?: any): Promise<T[]>;
  getPaginated(
    filter?: any,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<T>>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
