import { TMDBMediaTypeEnum, TMDBVideoDetailStatusEnum } from "@/utils/enum";
import { Prisma, Title } from "@prisma/client";
import {
  ICreatedByApiResponse,
  IGenreApiResponse,
  ILastEpisodeToAirApiResponse,
  INetworkApiResponse,
  IProductionCompanyApiResponse,
  IProductionCountryApiResponse,
  ISeasonApiResponse,
  ISpokenLanguageApiResponse,
  IGenreResponse,
  ISpokenLanguageResponse,
  IProductionCompanyResponse,
  IProductionCountryResponse,
  ICreatedByResponse,
  ILastEpisodeToAirResponse,
  INetworkResponse,
  ISeasonResponse
} from "@/utils/type";

export type TitleWithProvider = Prisma.TitleGetPayload<{
  include: {
    provider: true;
  };
}>;

export type TitleWithMetadata = Prisma.TitleGetPayload<{
  include: {
    metadata: true;
  };
}>;

export interface ITMDBSearchMultiMovieResponse {
  poster_path?: string;
  adult: boolean;
  overview: string;
  release_date: string;
  original_title: string;
  genre_ids: number[];
  id: number;
  media_type: TMDBMediaTypeEnum.MOVIE;
  original_language: string;
  title: string;
  backdrop_path?: string;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
}

export interface ITMDBSearchMultiTVResponse {
  poster_path?: string;
  popularity: number;
  id: number;
  overview: string;
  backdrop_path?: string;
  vote_average: number;
  media_type: TMDBMediaTypeEnum.TV;
  first_air_date: string;
  origin_country: string[];
  genre_ids: number[];
  original_language: string;
  vote_count: number;
  name: string;
  original_name: string;
}

export interface ITMDBSearchMultiPersonResponse {
  poster_path?: string;
  profile_path?: string;
  adult: boolean;
  id: number;
  media_type: TMDBMediaTypeEnum.PERSON;
  name: string;
  popularity: number;
  known_for: any[];
}

export type SearchMultiResultType =
  | ITMDBSearchMultiMovieResponse
  | ITMDBSearchMultiTVResponse
  | ITMDBSearchMultiPersonResponse;

export interface ITMDBSearchMultiResponse {
  page: number;
  total_results: number;
  total_pages: number;
  results: SearchMultiResultType[];
}

export interface ISearchMultiPayload {
  language?: string;
  query: string;
  page?: number;
  include_adult?: boolean;
  region?: string;
}

export interface ISearchMultiResponse {
  page: number;
  totalResults: number;
  totalPages: number;
  results: SearchMultiResultType[];
}

export interface IAddTitlePayload {
  name: string;
  tmdbId: number;
  posterPath: string;
  backdropPath: string;
  mediaType: TMDBMediaTypeEnum;
  metadata: SearchMultiResultType;
  tags: string[];
}

export interface IGetTitlePayload {
  limit: number;
  offset: number;
  query?: string;
  tmdbIds?: number[];
  includeMetadata?: boolean;
}

export interface IGetTitleResponse {
  results: (Title | TitleWithMetadata)[];
  totalResults: number;
}

export interface ITitle {
  id: string;
  name: string;
  tmdbId: number;
  providerId: string;
  active: boolean;
  posterPath?: string;
  backdropPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITMDBDetailApiResponse {
  id: number;
  name: string;
  poster_path?: string;
  backdrop_path?: string;
  original_language: string;
  genres: IGenreApiResponse[];
  overview: string;
  popularity: number;
  production_companies: IProductionCompanyApiResponse[];
  production_countries: IProductionCountryApiResponse[];
  spoken_languages: ISpokenLanguageApiResponse[];
  status: string;
  tagline?: string;
  vote_average: number;
  vote_count: number;
}

export interface ITMDBMovieDetailApiResponse extends ITMDBDetailApiResponse {
  adult: boolean;
  belongs_to_collection?: unknown;
  budget: number;
  imdb_id?: string;
  original_title: string;
  release_date: string;
  revenue: number;
  runtime?: number;
  title: string;
  video: boolean;
}

export interface ITMDBTvDetailApiResponse extends ITMDBDetailApiResponse {
  created_by: ICreatedByApiResponse[];
  episode_run_time: number[];
  first_air_date: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: ILastEpisodeToAirApiResponse;
  next_episode_to_air?: unknown;
  networks: INetworkApiResponse[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_name: string;
  seasons: ISeasonApiResponse[];
  type: string;
}

export interface ITMDBDetailResponse {
  id: number;
  name: string;
  posterPath?: string;
  backdropPath?: string;
  originalLanguage: string;
  genres: IGenreResponse[];
  overview: string;
  popularity: number;
  productionCompanies: IProductionCompanyResponse[];
  productionCountries: IProductionCountryResponse[];
  spokenLanguages: ISpokenLanguageResponse[];
  status: string;
  tagline?: string;
  voteAverage: number;
  voteCount: number;
}

export interface ITMDBMovieDetailResponse extends ITMDBDetailResponse {
  adult: boolean;
  belongsToCollection?: unknown;
  budget: number;
  imdbId?: string;
  originalTitle: string;
  releaseDate: string;
  revenue: number;
  runtime?: number;
  title: string;
  video: boolean;
}

export interface ITMDBTvDetailResponse extends ITMDBDetailResponse {
  createdBy: ICreatedByResponse[];
  episodeRunTime: number[];
  firstAirDate: string;
  inProduction: boolean;
  languages: string[];
  lastAirDate: string;
  lastEpisodeToAir: ILastEpisodeToAirResponse;
  nextEpisodeToAir?: unknown;
  networks: INetworkResponse[];
  numberOfEpisodes: number;
  numberOfSeasons: number;
  originCountry: string[];
  originalName: string;
  seasons: ISeasonResponse[];
  type: string;
}

export interface ITMDBGetDetailPayload {
  tmdbId: number;
  providerId: string;
}

export type ITMDBGetDetailResponse =
  | ITMDBMovieDetailResponse
  | ITMDBTvDetailResponse;

export interface IUpdateTitlePayload
  extends Partial<Omit<Title, "id" | "createdAt" | "updatedAt" | "active">> {
  tags?: string[];
}
