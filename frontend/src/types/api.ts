// Generic API types
// Database object types found in /lib/api/*

export type PagedResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};
