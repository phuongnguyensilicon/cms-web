import { getMovieDetail, getTvDetail, getTmdbMovieKeywords, getTmdbTvKeywords, getTmdbMovieExternals, getTmdbTvExternals, getTmdbMovieCertification, getTmdbTvCertification } from "@/utils/tmdb.util";
import { ICompareTitleStatus } from "@/model/media/media";
import { CompareTitleFieldName, TMDBMediaTypeEnum } from "@/utils/enum";
import { mediaService, metaDataService } from "@/service";
import { ITmdbMediaShortInfo } from "@/model/media/tmdp-media";
import prisma from "@/utils/prisma.util";
import { MediaItem, MediaItemCompareSync, MediaItemOriginal, MediaWatchProvider, Prisma, SyncTitleVersion } from "@prisma/client";
import { v4 } from "uuid";
import { formatOfDate }from "@/utils/date.util";
import { DATE_FORMAT } from "@/utils/constant.util";

class MediaTMDBSyncService {
  readonly SYNC_PAGE_SIZE = 20;
  public syncTitleInLists = async (): Promise<void> => {
    const syncVersion = await this.createSyncTitleVersion();
    
    const mediaItems = await prisma.mediaItem.findMany({
      include: {
        mediaWatchProviders: true
      },
      where: {
        AND: [
          {
            mediaType: {
              in: [TMDBMediaTypeEnum.MOVIE, TMDBMediaTypeEnum.TV]
            }
          },
          {
            mediaListNameItems: {
              some: {
                mediaItemId: {
                  not: ''
                }
              }
            }
          }
        ]
      }
    });
    
    for (let i = 0; i < mediaItems.length; i += this.SYNC_PAGE_SIZE) {
      const subMediaItems = mediaItems.slice(i, i + this.SYNC_PAGE_SIZE);
      await Promise.all(subMediaItems.map(mediaItem => this.processSyncTmdbTitle(mediaItem, true, syncVersion.id)));     
      
    }
    
  };

  public syncMediaItemTmdb = async (mediaItemId: string): Promise<void> =>  {
    const mediaItem = await prisma.mediaItem.findFirst({
      where: {
        id: mediaItemId
      },
      include: {
        mediaWatchProviders: true
      },
    });
    if (!mediaItem) {
      return;
    }

    await this.processSyncTmdbTitle(mediaItem, true);
  }

  public processSyncTmdbTitle = async (mediaItem: any, isSync: boolean, syncVersionId?: string): Promise<void> =>  {
    if (!syncVersionId) {
      const syncVersion = await this.createSyncTitleVersion();
      syncVersionId = syncVersion.id;
    }

    const mediaItemOriginal = await this.updateTmdbOriginalData(mediaItem, syncVersionId);

    if (!mediaItemOriginal) {
      return;
    }

    const compareStatus = await this.compareOriginalTmdbAndCurrent(mediaItem, mediaItemOriginal);
    if (!compareStatus.diffChanges.length) {
      return;
    }

    await prisma.mediaItemCompareSync.deleteMany({
      where: {
        mediaItemId: mediaItem.id,
        syncTitleVersionId: syncVersionId
      }
    });

    const mediaItemCompare: MediaItemCompareSync = {
      id: v4(),
      createdAt: new Date(),
      diffChanges: JSON.stringify(compareStatus.diffChanges),
      mediaItemId: mediaItem.id,
      syncTitleVersionId: syncVersionId,
      isRead: null,
      updatedAt: new Date()
    };

    await prisma.mediaItemCompareSync.create({data: mediaItemCompare});

    if (isSync) {
      const compareStatusTitles = compareStatus.diffChanges
        .filter(x => x.field !== CompareTitleFieldName.STREAMERS);

      const dataUpdate: Prisma.MediaItemUpdateInput = {
        updatedAt: new Date()
      };
      compareStatusTitles.forEach(diffChange => {
        if (diffChange.field === CompareTitleFieldName.NAME) {
          dataUpdate.name = mediaItemOriginal.name;
        }
        if (diffChange.field === CompareTitleFieldName.CERTIFICATION) {
          dataUpdate.certification = mediaItemOriginal.certification;
        }
        if (diffChange.field === CompareTitleFieldName.NUMBER_EPISODES) {
          dataUpdate.numberEpisodes = mediaItemOriginal.numberEpisodes;
        }
        if (diffChange.field === CompareTitleFieldName.NUMBER_EPISODES) {
          dataUpdate.numberEpisodes = mediaItemOriginal.numberEpisodes;
        }
        if (diffChange.field === CompareTitleFieldName.NUMBER_SEASONS) {
          dataUpdate.numberSeasons = mediaItemOriginal.numberSeasons;
        }
        if (diffChange.field === CompareTitleFieldName.RELEASE_DATE) {
          dataUpdate.releaseDate = mediaItemOriginal.releaseDate;
        }
        if (diffChange.field === CompareTitleFieldName.RUNTIME) {
          dataUpdate.runtime = mediaItemOriginal.runtime;
        }
        if (diffChange.field === CompareTitleFieldName.GENRES) {
          dataUpdate.genres = mediaItemOriginal.genres;
        }
        if (diffChange.field === CompareTitleFieldName.VOTE_AVERAGE) {
          dataUpdate.voteAverage = mediaItemOriginal.voteAverage;
          dataUpdate.voteAveragePercent = mediaService.voteAverageDisplay(mediaItemOriginal.voteAverage);
        }
      });

      if (compareStatusTitles?.length) {
        await prisma.mediaItem.update({
          where: {
            id: mediaItem.id
          },
          data: dataUpdate
        });
      }

      const hasChangeProvider = compareStatus.diffChanges
        .some(x => x.field === CompareTitleFieldName.STREAMERS);
      
      if (hasChangeProvider) {
        const watchMediaItems = mediaItem.mediaWatchProviders ?? [];
        const watchMediaItemOriginals = mediaItemOriginal.watchs
          ? JSON.parse(mediaItemOriginal.watchs)
          : [];

        const currentProviderIds: number[] = watchMediaItems.map((x: any) => x.providerId) ?? [];
        const originalProviderIds: number[] = watchMediaItemOriginals.map((x: any) => x.providerId) ?? [];

        const addMoreProviders = originalProviderIds.filter((x: number)  => !currentProviderIds.includes(x)) ?? [];
        const allProviders = await metaDataService.getStreamers();
        let newProviders: MediaWatchProvider[] = [];
        addMoreProviders.forEach(providerId => {
          const redisProvider = allProviders.filter(x => x.providerId === providerId)[0];
          if (redisProvider) {
            const newProvider: MediaWatchProvider = {
              createdAt: new Date(),
              id: v4(),
              isSelected: false,
              link: '',
              logoPath: redisProvider.logoPath,
              mediaItemId: mediaItem.id,
              providerId: redisProvider.providerId,
              providerName: redisProvider.providerName,
              tmdbId: mediaItem.tmdbId,
              updatedAt: new Date()
            };
            newProviders.push(newProvider);
          }
        })

        if (newProviders.length) {
          await prisma.mediaWatchProvider.createMany({data: newProviders});
        }
      }
    }
  }

  
  public getTmdbChangeByTitleIds = async (mediaItemIds: string[]): Promise<any[]> => {
    const keywordStreamer = `"field":"${CompareTitleFieldName.STREAMERS}"`;
    const keywordReleaseDate = `"field":"${CompareTitleFieldName.RELEASE_DATE}"`;

    const groupResponse = await prisma.mediaItemCompareSync.groupBy({
      by: ["mediaItemId"],
      where: {
        mediaItemId: {
          in: mediaItemIds
        },
        isRead: null,
        OR: [
          {
            diffChanges: {
              contains: keywordStreamer
            }
          },
          {
            diffChanges: {
              contains: keywordReleaseDate
            }
          }
        ]
      }
    });
    
    const data = groupResponse.map(mediaItem => {
      const item = {
        mediaItemId: mediaItem.mediaItemId
      };
      return item;
    });
    return data;
  }

  public updateReadLogByMediaItemIds = async (mediaItemIds: string[]): Promise<void> => {
    await prisma.mediaItemCompareSync.updateMany({
      where: {
        mediaItemId: {
          in: mediaItemIds
        }
      },
      data: {
        isRead: true
      }
    });
  }

  private updateTmdbOriginalData = async (mediaItem: MediaItem, syncVersionId: string): Promise<MediaItemOriginal|undefined> =>  {
    const tmdbDetailResponse = mediaItem.mediaType === TMDBMediaTypeEnum.MOVIE
        ? await getMovieDetail(mediaItem.tmdbId)
        : await getTvDetail(mediaItem.tmdbId);

    if (!tmdbDetailResponse) {
      return undefined;
    }

    const itemOriginalDb = await prisma.mediaItemOriginal.findFirst(
      {
        where: {
          AND: [
            { tmdbId: mediaItem.tmdbId },
            { mediaType: mediaItem.mediaType }
          ]
        }
      }
    );

    let mediaItemOriginal = await this.transformTmdbMediaToMediaItemOriginal(tmdbDetailResponse, mediaItem, syncVersionId);
    if (!mediaItemOriginal) {
      return undefined;
    }
    if (!itemOriginalDb) {
      await prisma.mediaItemOriginal.create({
        data: mediaItemOriginal
      });
    } else {
      mediaItemOriginal.id = itemOriginalDb.id;
      mediaItemOriginal.createdAt = itemOriginalDb.createdAt;

      await prisma.mediaItemOriginal.update({
        data: mediaItemOriginal,
        where: {
          id: itemOriginalDb.id
        }
      });
    }
    return mediaItemOriginal;

  }
  
  private compareOriginalTmdbAndCurrent = async (mediaItem: any, mediaItemOriginal: MediaItemOriginal): Promise<ICompareTitleStatus> =>  {
    let results: ICompareTitleStatus = {
      mediaItemId: mediaItem.id,
      diffChanges: []
    };

    if (mediaItem.name !== mediaItemOriginal.name) {

      results.diffChanges.push({
        field: CompareTitleFieldName.NAME,
        newValue: mediaItemOriginal.name,
        oldValue: mediaItem.name
      });
    }
    
    if (formatOfDate(DATE_FORMAT, mediaItem.releaseDate) !== formatOfDate(DATE_FORMAT, mediaItemOriginal.releaseDate)) {
      results.diffChanges.push({
        field: CompareTitleFieldName.RELEASE_DATE,
        newValue: mediaItemOriginal.releaseDate?.toISOString(),
        oldValue: mediaItem.releaseDate?.toISOString()
      });
    }

    if (mediaItem.certification !== mediaItemOriginal.certification) {
      results.diffChanges.push({
        field: CompareTitleFieldName.CERTIFICATION,
        newValue: mediaItemOriginal.certification ?? '',
        oldValue: mediaItem.certification ?? ''
      });
    }

    if (mediaItem.voteAverage !== mediaItemOriginal.voteAverage) {
      results.diffChanges.push({
        field: CompareTitleFieldName.VOTE_AVERAGE,
        newValue: mediaItemOriginal.voteAverage?.toString(),
        oldValue: mediaItem.voteAverage?.toString()
      });
    }

    if (mediaItem.runtime !== mediaItemOriginal.runtime) {
      results.diffChanges.push({
        field: CompareTitleFieldName.RUNTIME,
        newValue: mediaItemOriginal.runtime?.toString(),
        oldValue: mediaItem.runtime?.toString()
      });
    }

    if (mediaItem.numberEpisodes !== mediaItemOriginal.numberEpisodes) {
      results.diffChanges.push({
        field: CompareTitleFieldName.NUMBER_EPISODES,
        newValue: mediaItemOriginal.numberEpisodes?.toString(),
        oldValue: mediaItem.numberEpisodes?.toString()
      });
    }

    if (mediaItem.numberSeasons !== mediaItemOriginal.numberSeasons) {
      results.diffChanges.push({
        field: CompareTitleFieldName.NUMBER_SEASONS,
        newValue: mediaItemOriginal.numberSeasons?.toString(),
        oldValue: mediaItem.numberSeasons?.toString()
      });
    }
    
    const currentGenres: string[] = JSON.parse(mediaItem.genres ?? '[]') ?? [];
    const newGenres: string[] = JSON.parse(mediaItemOriginal.genres ?? '[]') ?? [];
    let hasChangeGenre = newGenres.some(x => !currentGenres.includes(x));
    if (!hasChangeGenre) {
      hasChangeGenre = currentGenres.some(x => !newGenres.includes(x));
    }
    if (hasChangeGenre) {
      results.diffChanges.push({
        field: CompareTitleFieldName.GENRES,
        newValue: mediaItemOriginal.genres?.toString(),
        oldValue: mediaItem.genres?.toString()
      });
    }

    const watchMediaItems = mediaItem.mediaWatchProviders ?? [];
    const watchMediaItemOriginals = mediaItemOriginal.watchs
      ? JSON.parse(mediaItemOriginal.watchs)
      : [];

    const currentProviderIds: number[] = watchMediaItems.map((x: any) => x.providerId) ?? [];
    const originalProviderIds: number[] = watchMediaItemOriginals.map((x: any) => x.providerId) ?? [];

    const hasChangeWatch = originalProviderIds.some((x: number)  => !currentProviderIds.includes(x));
    if (hasChangeWatch) {
      results.diffChanges.push({
        field: CompareTitleFieldName.STREAMERS,
        newValue: JSON.stringify(originalProviderIds ?? []),
        oldValue: JSON.stringify(currentProviderIds ?? [])
      });
    }

  

    return results;
  }

  public createSyncTitleVersion = async (): Promise<SyncTitleVersion> =>  {
    const today = new Date();
    const keyFormat = formatOfDate(DATE_FORMAT, today);

    let syncTitleVersion = await prisma.syncTitleVersion.findFirst({
      where: {
        key: keyFormat
      }
    });

    if (syncTitleVersion) {
      return syncTitleVersion;
    }
    syncTitleVersion = {
      id: v4(),
      createdAt: today,
      key: keyFormat,
      updatedAt: today,
    };

    await prisma.syncTitleVersion.create({data: syncTitleVersion});
    return syncTitleVersion;
  }

  private transformTmdbMediaToMediaItemOriginal= async (tmdbDetailResponse: ITmdbMediaShortInfo, mediaItem: MediaItem, syncVersionId: string) : Promise<MediaItemOriginal>=> {
    const genresArrs = tmdbDetailResponse.genres?.map(x => x.name) || [];
    const releaseDate = tmdbDetailResponse.release_date 
      ? new Date(tmdbDetailResponse.release_date)
      : tmdbDetailResponse.first_air_date
        ?  new Date(tmdbDetailResponse.first_air_date)
        : null;

    const code = mediaItem.mediaType;
    const tmdbId = mediaItem.tmdbId;
    const mediaItemId = mediaItem.id;

    const keywords = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieKeywords(tmdbId)
        : await getTmdbTvKeywords(tmdbId);
      
    const keywordJsons = JSON.stringify(keywords || []);
  
    const socialInfos = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieExternals(tmdbId)
        : await getTmdbTvExternals(tmdbId);
      
    const socialInfoJsons = socialInfos ? JSON.stringify(socialInfos) : ''; 

    const certification = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieCertification(tmdbId)
        : await getTmdbTvCertification(tmdbId);

    const watchProviders = await mediaService.getWatchProvidersByTmdbId(tmdbId,  mediaItemId , code);
    const watchProviderShort = watchProviders?.map(w => {
      const itm = {
        providerId: w.providerId,
        providerName: w.providerName
      }
      return itm;
    });
    
    const item: MediaItemOriginal = {
      active: true,
      backdropPath: tmdbDetailResponse.backdrop_path ?? "",
      createdAt: new Date(),
      genres: JSON.stringify(genresArrs),
      mediaType: code,
      name: tmdbDetailResponse.title ?? tmdbDetailResponse.name ?? "",
      overview: tmdbDetailResponse.overview ?? "",
      posterPath: tmdbDetailResponse.poster_path ?? "",
      releaseDate: releaseDate,
      status: tmdbDetailResponse.status ?? "",
      tmdbId,
      numberEpisodes: tmdbDetailResponse.number_of_episodes ?? null,
      numberSeasons: tmdbDetailResponse.number_of_seasons ?? null,
      runtime: tmdbDetailResponse.runtime 
        ? tmdbDetailResponse.runtime
        : tmdbDetailResponse.episode_run_time?.length
          ?  tmdbDetailResponse.episode_run_time.reduce((a, b) => a + b, 0)
          : null,
      voteAverage: tmdbDetailResponse.vote_average ?? null,
      updatedAt: new Date(),
      tags: JSON.stringify([]),
      budget: tmdbDetailResponse.budget || null,
      originalLanguage: tmdbDetailResponse.original_language ?? '',
      revenue: tmdbDetailResponse.revenue || null,
      tagline: tmdbDetailResponse.tagline ?? '',
      keywords: keywordJsons,
      productionCountries: JSON.stringify(tmdbDetailResponse.production_countries ?? []),
      socialInfos: socialInfoJsons,
      certification: certification,
      ads3rdUrl: null,
      credits: null,
      videos: null,
      watchs: JSON.stringify(watchProviderShort ?? []),
      syncTitleVersionId: syncVersionId,
      id: v4()
    };

    

    return item;
  }
}

const mediaTmdbSyncService = new MediaTMDBSyncService();

export default mediaTmdbSyncService;
