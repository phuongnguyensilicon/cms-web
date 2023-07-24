import instance from "@/utils/api.util";
import { IConfiguration } from "@/model/metadata/configuration";
import { IGenre, IGenreTmdbResponse } from "@/model/metadata/genre";
import { ITmdbCreditResponse, ITmdbMediaKeywordInfo, ITmdbMediaKeywordResponse, ITmdbMediaReviewInfo, ITmdbMediaReviewResponse, ITmdbMediaShortInfo, ITmdbTVCreditResponse, ITmdbWatchProviderResponse, ITmdbWatchProviderUSSummaryResponse } from "@/model/media/tmdp-media";
import { ITmdpBaseResponse } from "@/model/common/tmdp-response";
import { TMDBMediaTypeEnum, TMDBWatchProvider } from "./enum";
import { IRedisStreamer, ITmdbStreamer, ITmdbStreamerResponse } from "@/model/metadata/streamers";
import { AnyArn } from "aws-sdk/clients/groundstation";

export async function searchTvs(page: number, query: string): Promise<ITmdpBaseResponse<ITmdbMediaShortInfo>> {
  query = query ?? '';
  page = page <= 0? 1: page;
  
  const path = `/search/tv?page=${page}&query=${query}`;

  const { data } = await instance.get<ITmdpBaseResponse<ITmdbMediaShortInfo>>(path);
  
  return data;
}

export async function searchMovies(page: number, query: string): Promise<ITmdpBaseResponse<ITmdbMediaShortInfo>> {
  query = query ?? '';
  page = page <= 0? 1: page;
  
  const path = `/search/movie?page=${page}&query=${query}`;

  const { data } = await instance.get<ITmdpBaseResponse<ITmdbMediaShortInfo>>(path);
  
  return data;
}


export async function getMovieWatchProviderDetail(tmdbId: number): Promise<ITmdbWatchProviderResponse | undefined> {
  const path = `/movie/${tmdbId}/watch/providers`;
  const { data } = await instance.get<ITmdbWatchProviderUSSummaryResponse>(path);
  
  return data?.results?.US;
}

export async function getTvWatchProviderDetail(tmdbId: number): Promise<ITmdbWatchProviderResponse | undefined> {
  const path = `/tv/${tmdbId}/watch/providers`;
  const { data } = await instance.get<ITmdbWatchProviderUSSummaryResponse>(path);
  
  return data?.results?.US;
}

export async function getMovieDetail(tmdbId: number): Promise<ITmdbMediaShortInfo> {
  const path = `/movie/${tmdbId}?append_to_response=videos`;
  const { data } = await instance.get<ITmdbMediaShortInfo>(path);
  
  return data;
}


export async function getTvDetail(tmdbId: number): Promise<ITmdbMediaShortInfo> {
  const path = `/tv/${tmdbId}?append_to_response=videos`;
  const { data } = await instance.get<ITmdbMediaShortInfo>(path);
  
  return data;
}



export async function getTmdbMovieCredit(tmdbId: number): Promise<ITmdbCreditResponse> {
  const path = `/movie/${tmdbId}/credits`;
  const { data } = await instance.get<ITmdbCreditResponse>(path);
  
  return data;
}

export async function getTmdbMovieReviews(tmdbId: number): Promise<ITmdbMediaReviewInfo[]> {
  const path = `/movie/${tmdbId}/reviews`;
  const { data } = await instance.get<ITmdbMediaReviewResponse>(path);
  
  return data?.results ?? [];
}

export async function getTmdbTvReviews(tmdbId: number): Promise<ITmdbMediaReviewInfo[]> {
  const path = `/tv/${tmdbId}/reviews`;
  const { data } = await instance.get<ITmdbMediaReviewResponse>(path);
  
  return data?.results ?? [];
}

export async function getTmdbMovieKeywords(tmdbId: number): Promise<ITmdbMediaKeywordInfo[]> {
  const path = `/movie/${tmdbId}/keywords`;
  const { data } = await instance.get<ITmdbMediaKeywordResponse>(path);
  
  return data?.keywords ?? [];
}

export async function getTmdbTvKeywords(tmdbId: number): Promise<ITmdbMediaKeywordInfo[]> {
  const path = `/tv/${tmdbId}/keywords`;
  const { data } = await instance.get<any>(path);
  
  return data?.results ?? [];
}

export async function getTmdbMovieExternals(tmdbId: number): Promise<any> {
  const path = `/movie/${tmdbId}/external_ids`;
  const { data } = await instance.get<any>(path);
  
  return data;
}

export async function getTmdbTvExternals(tmdbId: number): Promise<any> {
  const path = `/tv/${tmdbId}/external_ids`;
  const { data } = await instance.get<any>(path);
  
  return data;
}

export async function getTmdbTvCredit(tmdbId: number): Promise<ITmdbCreditResponse> {
  const detailPath = `/tv/${tmdbId}`;
  const { data } = await instance.get<any>(detailPath);
  if (!data) {
    return {
      cast: [],
      crew: []
    };
  }

  const seasons = data.seasons ?? [];
  if (!seasons?.length) {
    return {
      cast: [],
      crew: []
    };
  }

  const seasonIds = seasons.map((s: any) => s.season_number);

  const episodeTaskInfos = await Promise.all(seasonIds
    .map((seasonId: number) => getSeasonAndEpsodies(tmdbId, seasonId)));

  let episodeInfos: any[] = [];
  episodeTaskInfos.forEach(item => {
    episodeInfos = episodeInfos.concat(item);
  });

  let pageSize = 100;
  let allItems: ITmdbTVCreditResponse[] = [];
  for (let i = 0; i < episodeInfos.length; i += pageSize) {
    const subEpisodeInfos = episodeInfos.slice(i, i + pageSize);
    const items = await Promise.all(subEpisodeInfos
      .map((episodeInfo: any) => getEpsodiesCredits(tmdbId, episodeInfo.seasonId, episodeInfo.episodeId)));
      allItems = allItems.concat(items);
  }

  allItems = (allItems??[])
        .sort(function(a: any, b: any) {return b.seasonId - a.seasonId})
        .sort(function(a: any, b: any) {return b.episodeId - a.episodeId});

  const mulIndex = 1000;
  let results: ITmdbCreditResponse = {
    cast: [],
    crew: []
  };
  let index = 0;
  allItems.forEach(item => {
    let crews = item.crew ?? [];
    crews.forEach(crew => {
      if (!results.crew?.some(c => c.id === crew.id)) {
        results.crew?.push(crew);
      }
    })

    let casts = item.cast ?? [];
    casts.forEach(cast => {
      if (!results.cast?.some(c => c.id === cast.id)) {
        if (cast.order) {
          cast.order = mulIndex * index + cast.order;
        }
        results.cast?.push(cast);
      }
    })

    index++;
  }) 
  return results;
}

export async function getEpsodiesCredits(tmdbId: number, seasonId: number, episodeId: number): Promise<ITmdbTVCreditResponse> {
  const path = `/tv/${tmdbId}/season/${seasonId}/episode/${episodeId}/credits`;
  const { data } = await instance.get<any>(path);  
  let result: ITmdbTVCreditResponse = {
    episodeId,
    seasonId,
    cast: data?.cast ?? [],
    crew: data?.crew ?? [],
  };

  if (data?.guest_stars?.length) {
    result.cast = result.cast?.concat(data.guest_stars);
  }
  return result;
}

export async function getSeasonAndEpsodies(tmdbId: number, seasonId: number): Promise<any[]> {
  const path = `/tv/${tmdbId}/season/${seasonId}`;
  const { data } = await instance.get<any>(path);
  if (!data?.episodes?.length ) {
    return [];
  }

  const results = data.episodes.map((episode: any) => {
    const item = {
      seasonId: seasonId,
      episodeId: episode.episode_number
    };
    return item;
  });
  
  return results;
}

export async function getTmdbGenre(): Promise<IGenre[]> {
  const tvPath = '/genre/tv/list';
  const moviePath = '/genre/movie/list';
  const tvGenreResponse = await instance.get<IGenreTmdbResponse>(tvPath);
  const movieGenreResponse = await instance.get<IGenreTmdbResponse>(moviePath);
  let result: IGenre[] = [];
  if (tvGenreResponse?.data?.genres?.length) {
    result = result.concat(tvGenreResponse.data.genres);
  }
  if (movieGenreResponse?.data?.genres?.length) {
    result = result.concat(movieGenreResponse.data.genres);
  }
  
  return result;
}

export async function getTmdbConfiguration(): Promise<IConfiguration> {
  const path = '/configuration';
  const { data } = await instance.get<IConfiguration>(path);
  return data;
}

export async function getTmdbStreamers(): Promise<IRedisStreamer[]> {
  const tvPath = '/watch/providers/tv';
  const moviePath = 'watch/providers/movie';
  const tvStreamersResponse = await instance.get<ITmdbStreamerResponse>(tvPath);
  const movieStreamerResponse = await instance.get<ITmdbStreamerResponse>(moviePath);
  let tmdbResults: ITmdbStreamer[] = [];
  if (tvStreamersResponse?.data?.results?.length) {
    const items = tvStreamersResponse
                    .data
                    .results
                    .filter(streamer => streamer.display_priorities?.US !== undefined);
    if (items.length) {
      tmdbResults = tmdbResults.concat(items);
    }
  }
  if (movieStreamerResponse?.data?.results?.length) {
    const items = movieStreamerResponse
                    .data
                    .results
                    .filter(streamer => !tmdbResults.map(x => x.provider_id).includes(streamer.provider_id) 
                              && streamer.display_priorities?.US !== undefined
                    );

    if (items.length) {
      tmdbResults = tmdbResults.concat(items);
    }
  }
  
  const results = tmdbResults.map(item => {
    const itemConvert: IRedisStreamer = {
      logoPath: item.logo_path,
      providerId: item.provider_id,
      providerName: item.provider_name
    };
    return itemConvert;
  })
  return results;
}


export async function getTmdbMovieCertification(tmdbId: number): Promise<string> {
  const path = `/movie/${tmdbId}/release_dates`;
  const { data } = await instance.get<any>(path);
  
  const items = data?.results ?? [];
  const certification = items.filter((x: any) => x.iso_3166_1 === 'US')[0];
  if (certification?.release_dates?.length) {
    return certification.release_dates[0].certification;
  }
  return '';
}

export async function getTmdbTvCertification(tmdbId: number): Promise<string> {
  const path = `/tv/${tmdbId}/content_ratings`;
  const { data } = await instance.get<any>(path);
  
  const items = data?.results ?? [];
  const certification = items.filter((x: any) => x.iso_3166_1 === 'US')[0];
  return certification?.rating ?? '';
}


export async function getTmdbRecommendations(tmdbId: number, code: string): Promise<any[]> {
  let page = 1;
  if (tmdbId <= 0) {
    return [];
  }
  const dataPage1 = await getTmdbRecommendationResults(tmdbId, code, page);
  
  const itemPage1s = dataPage1?.results ?? [];
  let results = itemPage1s.map((x: any) => {
    const item = {
      id: x.id,
      mediaType: x.media_type
    }
    return item;
  });

  page++;
  const totalPage: number = dataPage1?.total_pages;
  let allTasks: Promise<any>[] = [];

  while (page <= totalPage) {
    const task = getTmdbRecommendationResults(tmdbId, code, page);
    allTasks.push(task);
    page++;
  }
  
  const allTaskResults: any[] = await Promise.all(allTasks);
  allTaskResults.forEach(data => {
    const newItems = data?.results ?? [];
    const newResults = newItems.map((x: any) => {
      const item = {
        id: x.id,
        mediaType: x.media_type
      }
      return item;
    });
    results = results.concat(newResults);
  })
  
  return results ?? [];
}


async function getTmdbRecommendationResults (tmdbId: number, code: string, page: number): Promise<any> {
  const path = `/${code}/${tmdbId}/recommendations?page=${page}}`;
  const { data } = await instance.get<any>(path);

  return data;
}


export async function getTmdbMovieVideos(tmdbId: number): Promise<any[]> {
  try {
    const path = `/movie/${tmdbId}/videos`;
    const { data } = await instance.get<any>(path);
    
    const items = data?.results ?? [];
    return items;
  } catch (err){
    console.log(err);
  }
  return [];
}

export async function getTmdbTvVideos(tmdbId: number): Promise<any[]> {
  try {
    const path = `/tv/${tmdbId}/videos`;
    const { data } = await instance.get<any>(path);
    
    const items = data?.results ?? [];
    return items;
  } catch (err){
    console.log(err);
  }
  return [];
}