import { PaginationMeta } from '../responses/ApiResponse';

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export const getPaginationParams = (
  query: PaginationParams,
  defaultLimit = 10,
  maxLimit = 100
): { page: number; limit: number; skip: number } => {
  const pageNumber = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const limitNumber = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(query.limit || defaultLimit), 10) || defaultLimit)
  );
  const skip = (pageNumber - 1) * limitNumber;

  return {
    page: pageNumber,
    limit: limitNumber,
    skip
  };
};

export const buildPaginationMeta = (
  totalItems: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
