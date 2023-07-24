import { float } from "aws-sdk/clients/cloudfront";

export interface ITmdbMediaShortInfo {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  status?: string;
  release_date?: Date;
  first_air_date?: Date;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  tagline?: string;
  budget?: number;
  original_language?: string;
  revenue?: number;
  episode_run_time?: number[];
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  genre_ids?: number[];
  genres?: ITmdbGenre[];
  videos?: ITmdbVideoResult;
  created_by?: ITmdbCredit[];
  production_countries?: ITmdbProductCountry[];
}

export interface ITmdbProductCountry {
  iso_3166_1?: string;
  name?: string;
}

export interface ITmdbVideoResult {
  results: ITmdbMediaAdditional[];
}

export interface ITmdbGenre {
  id: number;
  name: string;
}


export interface ITmdbMediaAdditional {
  name: string;
  key: string;
  site: string;
  type?: string;
}

export interface ITmdbCredit {
  adult?: boolean;
  known_for_department: string;
  name: string;
  gender: number;
  profile_path: string | null;
  job?: string;
  department?: string;
  order?: number;
  id: number;
}


export interface ITmdbTVCreditResponse extends ITmdbCreditResponse {
  seasonId: number;
  episodeId: number
}

export interface ITmdbCreditResponse {
  cast?: ITmdbCredit[];
  crew?: ITmdbCredit[];
}


export interface ITmdbWatchProviderUSSummaryResponse {
  results: ITmdbWatchProviderUSDetailResponse;
}

export interface ITmdbWatchProviderUSDetailResponse {
  US: ITmdbWatchProviderResponse;
}

export interface ITmdbWatchProviderResponse {
  link: string;
  flatrate: ITmdbWatchProviderFlatrateResponse[];
  buy: ITmdbWatchProviderFlatrateResponse[];
  rent: ITmdbWatchProviderFlatrateResponse[];
}


export interface ITmdbWatchProviderFlatrateResponse {
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface ITmdbMediaReviewResponse {
  results: ITmdbMediaReviewInfo[];
}


export interface ITmdbMediaReviewInfo {
  author: string;
  author_details: ITmdbMediaReviewAuthorInfo;
  content: string;
  url?: string;
}


export interface ITmdbMediaReviewAuthorInfo {
  name?: string;
  username?: string;
  avatar_path?: string;
  rating?: number;
}



export interface ITmdbMediaKeywordResponse {
  keywords: ITmdbMediaKeywordInfo[];
}


export interface ITmdbMediaKeywordInfo {
  id: number;
  name: string;
}
