
export interface ITmdpBaseResponse<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}


export interface IBaseResponse<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}


export interface IBaseScrollResponse<T> {
  hasMoreItem: boolean;
  results: T[];
}

export interface IRestReponse<T> {
  error?: string;
  result?: T;
}