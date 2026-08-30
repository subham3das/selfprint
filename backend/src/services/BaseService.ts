import { IBaseRepository, IBaseService, PaginatedResult } from '../interfaces';
import { PaginationParams } from '../utils/pagination';
import { NotFoundError } from '../errors';

/**
 * Abstract Generic Base Service implementing core business service logic
 */
export abstract class BaseService<T> implements IBaseService<T> {
  protected readonly repository: IBaseRepository<T>;
  protected readonly resourceName: string;

  constructor(repository: IBaseRepository<T>, resourceName = 'Resource') {
    this.repository = repository;
    this.resourceName = resourceName;
  }

  public async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  public async getById(id: string): Promise<T> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundError(`${this.resourceName} with ID '${id}' not found.`);
    }
    return item;
  }

  public async getAll(filter: any = {}): Promise<T[]> {
    return this.repository.find(filter);
  }

  public async getPaginated(
    filter: any = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<T>> {
    return this.repository.findWithPagination(filter, pagination);
  }

  public async update(id: string, data: Partial<T>): Promise<T> {
    const updated = await this.repository.updateById(id, data);
    if (!updated) {
      throw new NotFoundError(`${this.resourceName} with ID '${id}' not found.`);
    }
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(`${this.resourceName} with ID '${id}' not found.`);
    }
    return true;
  }
}

export default BaseService;
