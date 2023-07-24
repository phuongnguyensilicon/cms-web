import { getBackgroundProvider } from "@/mapping/streamer-image.logo";
import { IBaseResponse, ITmdpBaseResponse } from "@/model/common/tmdp-response";
import { IMediaAdditionalInfo, IMediaShortInfo } from "@/model/media/media";
import { ITmdbMediaShortInfo, ITmdbVideoResult } from "@/model/media/tmdp-media";
import { IRedisMediaAdditionalInfo, IRedisMediaWatchProviderInfo } from "@/model/redis/redis-media-list.name";
import { SCORE_DEFAULT } from "@/utils/constant.util";
import { ClixTitleVideoType, MediaDetailSourceEnum, TMDBAdditionalTypeEnum } from "@/utils/enum";
import { MediaAdditionalItem, MediaWatchProvider } from "@prisma/client";

export function transformTmdbBaseResponse(item: ITmdpBaseResponse<ITmdbMediaShortInfo>, mediaType: string): IBaseResponse<IMediaShortInfo> {
  const result: IBaseResponse<IMediaShortInfo> = {
    page: item.page,
    results: item.results.map(it => transformITmdbMediaShortInfo(it, mediaType)),
    totalPages: item.total_pages,
    totalResults: item.total_results
  };

  return result;
}



export function transformITmdbMediaShortInfo(item: ITmdbMediaShortInfo, mediaType: string): IMediaShortInfo {
  const result:IMediaShortInfo = {
    backdropPath: item.backdrop_path ?? "",
    mediaType: mediaType,
    name: item.title ?? item.name ?? '',
    overview: item.overview,
    posterPath: item.poster_path ?? "",
    releaseDate: item.release_date ?? item.first_air_date,
    customReleaseDate: item.release_date ?? item.first_air_date,
    active: true,
    tmdbId: item.id,
    numberEpisodes: item.number_of_episodes ?? undefined,
    numberSeasons: item.number_of_seasons ?? undefined,
    runtime: item.runtime ?? undefined,
    voteAverage: item.vote_average ?? undefined,
    voteAveragePercent: !item.vote_average ? "": `${(item.vote_average* 10).toFixed()}%`,
    genres: (item.genres??[]).map(x => x.name),
    score: SCORE_DEFAULT,
    createdAt: new Date(),
    videos: (item.videos?.results??[]).map(vid => {
      const item: IMediaAdditionalInfo = {
        key: vid.key,
        name: vid.name,
        site: vid.site,
        active: true,
        source: MediaDetailSourceEnum.TMDB,
        mostPopular: false,
        isSelected: false
      };
      return item;
    })
  };
  
  return result;
}


export function transformUrl(host: string, size: string, path: string): string {
  const pathconvert = `${host}${size}${path}`;
  return pathconvert;
}

export function transformWatchProviders(watchProviders?: MediaWatchProvider[]): IRedisMediaWatchProviderInfo[] {
  if (!watchProviders ||! watchProviders?.length) {
    return [];
  }
  const result = watchProviders.map(w => {
    let itm: IRedisMediaWatchProviderInfo = {
      logoPath: w.logoPath,
      providerId: w.providerId ?? 0,
      providerName: w.providerName,
      isSelected: w.isSelected ?? false,
      bgColor: getBackgroundProvider(w.providerId ?? 0),
      link: w.link ?? '',
    }
    return itm;
  });

  return result;
}

export function transformSelectedWatchProvider(watchProviders?: MediaWatchProvider[]): IRedisMediaWatchProviderInfo|undefined {
  const watchs = transformWatchProviders(watchProviders);

  let result = watchs.filter(x => x.isSelected)[0];
    if (!result) {
      result = watchs[0];
    }
  return result;
}

export function transformMediaDisplayOrder(name: string, source: string, isMostPopular: boolean, isSelected: boolean): number {
  if (isSelected) {
    return 1;
  }

  if (isMostPopular) {
    return 2;
  }

  const displayOrderKey = 'clip';
  if (source === MediaDetailSourceEnum.CLIX) {
    if (name?.toLowerCase().includes(displayOrderKey)) {
      return 5;
    }
    return 10;
  }
  
  return 15;
}

export function transformRedisTitleVideos(videos?: MediaAdditionalItem[]): IRedisMediaAdditionalInfo[] {
  if (!videos || !videos?.length) {
    return [];
  }
  let results: IRedisMediaAdditionalInfo[] = [];
  const trailer = transformTrailerMedia(videos);
  if (trailer) {
    results.push(trailer);
  }
  const game = transformGameMedia(videos);
  if (game) {
    results.push(game);
  }
  
  return results;
}

export function transformTrailerMedia(videos?: MediaAdditionalItem[]): IRedisMediaAdditionalInfo|undefined {
  if (!videos ||! videos?.length) {
    return undefined;
  }
  const item = videos.map(vid => {
    const itm: IRedisMediaAdditionalInfo = {
      key: vid.key,
      name: vid.name,
      site: vid.site,
      source: vid.source ?? '',
      displayOrder: transformTrailerMediaDisplayOrder(vid),
      type: ClixTitleVideoType.TRAILER,
      thumbnailUrl: vid.thumbnailUrl ?? ''
    };
    return itm;
  }).sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder})[0];
  const result: IRedisMediaAdditionalInfo = {...item, source: item.source ?? ''};
  return result;
}


export function transformGameMedia(videos?: MediaAdditionalItem[]): IRedisMediaAdditionalInfo|undefined {
  if (!videos || !videos?.length) {
    return undefined;
  }
  const item = videos.map(vid => {
    const itm:IRedisMediaAdditionalInfo = 
    {
      key: vid.key,
      name: vid.name,
      site: vid.site,
      source: vid.source ?? '',
      displayOrder: transformMediaGameDisplayOrder(vid),
      type: ClixTitleVideoType.GAME,
      thumbnailUrl: vid.thumbnailUrl ?? ''
    };
    return itm;
  }).sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder})[0];

  const result: IRedisMediaAdditionalInfo = {...item, source: item.source ?? ''};
  return result;
}

export function transformMediaGameDisplayOrder(video: MediaAdditionalItem): number {
  if (video.type === TMDBAdditionalTypeEnum.CLIP) {
    return 1;
  }

  if (video.type === TMDBAdditionalTypeEnum.TEASER) {
    return 2;
  }

  if (!!video.isSelected) {
    return 3;
  }

  if (!!video.mostPopular) {
    return 4;
  }

  const displayOrderKey = 'clip';
  if (video.source === MediaDetailSourceEnum.CLIX) {
    if (video.name?.toLowerCase().includes(displayOrderKey)) {
      return 5;
    }
    return 6;
  }
  
  return 10;
}

export function transformTrailerMediaDisplayOrder(video: MediaAdditionalItem): number {
  if (!!video.isSelected) {
    return 1;
  }

  if (!!video.mostPopular) {
    return 2;
  }

  const displayOrderKey = 'clip';
  if (video.source === MediaDetailSourceEnum.CLIX) {
    if (video.name?.toLowerCase().includes(displayOrderKey)) {
      return 5;
    }
    return 10;
  }
  
  return 15;
}