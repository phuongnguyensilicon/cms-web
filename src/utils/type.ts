export interface IGetTitleParams {
  params: {
    titleId: string;
  };
}

export interface IGetTmdbTitleParams {
  params: {
    tmdbId: string;
  };
}

export type HookFunction<TState, TActions> = [TState, TActions];

export interface IListResponse<T> {
  total: number;
  items: T[];
}

export interface IGenreApiResponse {
  id: number;
  name: string[];
}

export interface IProductionCompanyApiResponse {
  id: number;
  name: string[];
  logo_path?: string;
  origin_country: string;
}

export interface IProductionCountryApiResponse {
  iso_3166_1: string;
  name: string;
}

export interface ISpokenLanguageApiResponse {
  iso_639_1: string;
  name: string;
}

export interface ICreatedByApiResponse {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path?: string;
}

export interface ILastEpisodeToAirApiResponse {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  season_number: number;
  still_path?: string;
  vote_average: number;
  vote_count: number;
}

export interface INetworkApiResponse {
  name: string;
  id: number;
  logo_path?: string;
  origin_country: string;
}

export interface ISeasonApiResponse {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

export interface IGenreResponse {
  id: number;
  name: string[];
}

export interface IProductionCompanyResponse {
  id: number;
  name: string[];
  logoPath?: string;
  originCountry: string;
}

export interface IProductionCountryResponse {
  iso_3166_1: string;
  name: string;
}

export interface ISpokenLanguageResponse {
  iso_639_1: string;
  name: string;
}

export interface ICreatedByResponse {
  id: number;
  creditId: string;
  name: string;
  gender: number;
  profilePath?: string;
}

export interface ILastEpisodeToAirResponse {
  airDate: string;
  episodeNumber: number;
  id: number;
  name: string;
  overview: string;
  productionCode: string;
  seasonNumber: number;
  stillPath?: string;
  voteAverage: number;
  voteCount: number;
}

export interface INetworkResponse {
  name: string;
  id: number;
  logoPath?: string;
  originCountry: string;
}

export interface ISeasonResponse {
  airDate: string;
  episodeCount: number;
  id: number;
  name: string;
  overview: string;
  posterPath: string;
  seasonNumber: number;
}

export interface IGetByTitleIdAndProviderNamePayload {
  tmdbId: number;
  providerName: string;
}
