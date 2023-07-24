import axios from "axios";
import {
  ICreatedByApiResponse,
  ICreatedByResponse,
  IGetByTitleIdAndProviderNamePayload,
  ILastEpisodeToAirApiResponse,
  ILastEpisodeToAirResponse,
  IListResponse,
  INetworkApiResponse,
  INetworkResponse,
  IProductionCompanyApiResponse,
  IProductionCompanyResponse,
  ISeasonApiResponse,
  ISeasonResponse
} from "@/utils/type";
import instance from "@/utils/api.util";
import {
  ITMDBSearchMultiResponse,
  ISearchMultiPayload,
  ISearchMultiResponse,
  ITitle,
  ITMDBTvDetailApiResponse,
  ITMDBMovieDetailApiResponse,
  ITMDBMovieDetailResponse,
  ITMDBTvDetailResponse,
  ITMDBGetDetailResponse
} from "@/service/title/title.type";
import { TMDBMediaTypeEnum } from "@/utils/enum";
import { ERROR_CODE } from "@/utils/constant.util";

class TitleRepository {
  private _endpointDetailMapping: {
    [key: string]: (tmdbId: number) => string;
  } = {
    [TMDBMediaTypeEnum.MOVIE]: (tmdbId: number) => `/movie/${tmdbId}`,
    [TMDBMediaTypeEnum.TV]: (tmdbId: number) => `/tv/${tmdbId}`
  };

  private _transformProductionCompanyData = (
    data: IProductionCompanyApiResponse
  ): IProductionCompanyResponse => ({
    id: data.id,
    name: data.name,
    logoPath: data.logo_path,
    originCountry: data.origin_country
  });

  private _transformCreatedByResponseData = (
    data: ICreatedByApiResponse
  ): ICreatedByResponse => ({
    id: data.id,
    creditId: data.credit_id,
    name: data.name,
    gender: data.gender,
    profilePath: data.profile_path
  });

  private _transformLastEpisodeToAirResponseData = (
    data: ILastEpisodeToAirApiResponse
  ): ILastEpisodeToAirResponse => ({
    airDate: data.air_date,
    episodeNumber: data.episode_number,
    id: data.id,
    name: data.name,
    overview: data.overview,
    productionCode: data.production_code,
    seasonNumber: data.season_number,
    stillPath: data.still_path,
    voteAverage: data.vote_average,
    voteCount: data.vote_count
  });

  private _transformNetworkResponseData = (
    data: INetworkApiResponse
  ): INetworkResponse => ({
    name: data.name,
    id: data.id,
    logoPath: data.logo_path,
    originCountry: data.origin_country
  });

  private _transformSeasonResponseData = (
    data: ISeasonApiResponse
  ): ISeasonResponse => ({
    airDate: data.air_date,
    episodeCount: data.episode_count,
    id: data.id,
    name: data.name,
    overview: data.overview,
    posterPath: data.poster_path,
    seasonNumber: data.season_number
  });

  private _transformMovieData = (
    data: ITMDBMovieDetailApiResponse
  ): ITMDBMovieDetailResponse => ({
    id: data.id,
    name: data.name,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    originalLanguage: data.original_language,
    genres: data.genres,
    overview: data.overview,
    popularity: data.popularity,
    productionCompanies: data.production_companies.map(
      this._transformProductionCompanyData
    ),
    productionCountries: data.production_countries,
    spokenLanguages: data.spoken_languages,
    status: data.status,
    tagline: data.tagline,
    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    adult: data.adult,
    belongsToCollection: data.belongs_to_collection,
    budget: data.budget,
    imdbId: data.imdb_id,
    originalTitle: data.original_title,
    releaseDate: data.release_date,
    revenue: data.revenue,
    runtime: data.runtime,
    title: data.title,
    video: data.video
  });

  private _transformTvData = (
    data: ITMDBTvDetailApiResponse
  ): ITMDBTvDetailResponse => ({
    id: data.id,
    name: data.name,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    originalLanguage: data.original_language,
    genres: data.genres,
    overview: data.overview,
    popularity: data.popularity,
    productionCompanies: data.production_companies.map(
      this._transformProductionCompanyData
    ),
    productionCountries: data.production_countries,
    spokenLanguages: data.spoken_languages,
    status: data.status,
    tagline: data.tagline,
    voteAverage: data.vote_average,
    voteCount: data.vote_count,

    createdBy: data.created_by.map(this._transformCreatedByResponseData),
    episodeRunTime: data.episode_run_time,
    firstAirDate: data.first_air_date,
    inProduction: data.in_production,
    languages: data.languages,
    lastAirDate: data.last_air_date,
    lastEpisodeToAir: this._transformLastEpisodeToAirResponseData(
      data.last_episode_to_air
    ),
    nextEpisodeToAir: data.next_episode_to_air,
    networks: data.networks.map(this._transformNetworkResponseData),
    numberOfEpisodes: data.number_of_episodes,
    numberOfSeasons: data.number_of_seasons,
    originCountry: data.origin_country,
    originalName: data.original_name,
    seasons: data.seasons.map(this._transformSeasonResponseData),
    type: data.type
  });

  public createSearchMultiQuerystring = (
    payload?: ISearchMultiPayload
  ): string => {
    if (!payload) return "";
    const { language, query, page = 1, include_adult, region } = payload;
    let querystring = `?query=${query}`;
    if (language) {
      querystring += `&language=${language}`;
    }
    if (page) {
      querystring += `&page=${page}`;
    }
    if (include_adult) {
      querystring += `&include_adult=${include_adult}`;
    }
    if (region) {
      querystring += `&region=${region}`;
    }
    return querystring;
  };
  // https://developers.themoviedb.org/3/search/multi-search
  public searchMultiFromTMDB = async (
    query?: ISearchMultiPayload
  ): Promise<ISearchMultiResponse> => {
    let querystring = this.createSearchMultiQuerystring(query);

    const { data } = await instance.get<ITMDBSearchMultiResponse>(
      `/search/multi${querystring}`
    );

    return {
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results: data.results,
      page: data.page
    };
  };

  public getsByTmdbIds = async (tmdbIds: number[]): Promise<ITitle[]> => {
    const {
      data: { data }
    } = await axios.get(
      `/api/title?limit=-1&offset=-1&tmdbIds=${tmdbIds.join(",")}`
    );
    const { items } = data as IListResponse<ITitle>;
    return items as ITitle[];
  };

  public getById = async ({
    tmdbId,
    providerName
  }: IGetByTitleIdAndProviderNamePayload): Promise<ITMDBGetDetailResponse> => {
    try {
      const endpoint = this._endpointDetailMapping[providerName](tmdbId);
      const { data } = await instance.get<
        ITMDBTvDetailApiResponse | ITMDBMovieDetailApiResponse
      >(endpoint);
      if (providerName === TMDBMediaTypeEnum.MOVIE) {
        return this._transformMovieData(data as ITMDBMovieDetailApiResponse);
      }
      return this._transformTvData(data as ITMDBTvDetailApiResponse);
    } catch (err) {
      console.error(err);
      throw new Error(ERROR_CODE.VIDEO_DETAIL_NOT_FOUND);
    }
  };
}

const titleRepository = new TitleRepository();

export default titleRepository;
