import { getThumbnailUrl } from "@/metadata/videos";
import { IUpsertPromoAdsRequest } from "@/model/promo-ads/promoAds";
import { IRedisMediaAdditionalInfo, IRedisMediaItemInfo } from "@/model/redis/redis-media-list.name";
import { metaDataService, redisService } from "@/service";
import { transformMediaDisplayOrder, transformRedisTitleVideos, transformSelectedWatchProvider } from "@/transform/media.transform";
import { isAbsolutePath } from "@/utils/common.util";
import { SCORE_DEFAULT } from "@/utils/constant.util";
import { CMSEventEnum, ClixTitleVideoType, DEFAULT_WATCH_PROVIDER_NAME, MediaDetailSourceEnum, TMDBAdditionalSiteEnum, TMDBMediaTypeEnum, TMDBSizeEnum } from "@/utils/enum";
import prisma from "@/utils/prisma.util";
import emitter from "@events/index";
import { MediaAdditionalItem, MediaItem, MediaWatchProvider, Prisma } from "@prisma/client";
import { v4 } from "uuid";

class PromoAdsService {
  public upsertPromoAds = async (request: IUpsertPromoAdsRequest): Promise<string|undefined> => {
    const isAddNew = !request.id;
    let mediaItem: MediaItem|null = !isAddNew
      ? await prisma.mediaItem.findFirst({
        where: { 
          AND: [
            {id: request.id},
            {mediaType: {
              in: [TMDBMediaTypeEnum.ADS, TMDBMediaTypeEnum.PROMOS]
            }}
          ]
        }
      })
      : null;

    if (!isAddNew && !mediaItem) {
      return undefined;
    }

    if (isAddNew) {
      mediaItem = { 
        id: v4(),
        active: true,
        posterPath: request.posterPath,
        overview: request.overview ?? '',
        mediaType: request.ads3rdUrl ? TMDBMediaTypeEnum.ADS: TMDBMediaTypeEnum.PROMOS,
        ads3rdUrl: request.ads3rdUrl ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        releaseDate: new Date(),
        tmdbId: 0,
        name: request.name ?? '',
        backdropPath: null,
        budget: null,
        certification: null,
        genres: '[]',
        keywords: null,
        numberEpisodes: null,
        numberSeasons: null,
        originalLanguage: null,
        productionCountries: null,
        recommendationTmdbIds: null,
        revenue: null,
        runtime: null,
        socialInfos: null,
        status: null,
        tagline: null,
        tags: null,
        voteAverage: null,
        voteAveragePercent: null,
        customReleaseDate: null
      };

      await prisma.mediaItem.create({data: mediaItem});
    } else {
      let updateData: Prisma.MediaItemUpdateInput = {
        updatedAt: new Date(),
        ads3rdUrl: request.ads3rdUrl ?? null,
        name: request.name ?? '',
        overview: request.overview ?? '',
        mediaType: request.ads3rdUrl ? TMDBMediaTypeEnum.ADS: TMDBMediaTypeEnum.PROMOS
      };

      if (request.posterPath) {
        updateData.posterPath = request.posterPath;
      }

      await prisma.mediaItem.update({
        where: {id: mediaItem?.id ?? ''},
        data: updateData
      });
    }

    await prisma.mediaWatchProvider.deleteMany({
      where: {
        mediaItemId: mediaItem?.id
      }
    });
    let watchProviders: MediaWatchProvider[] = [];
    if (request?.watchProvider?.logoPath
        && isAbsolutePath(request.watchProvider.logoPath)) {
      const watchProvider: MediaWatchProvider = {
        id: v4(),
        createdAt: new Date(),
        isSelected: true,
        link: request.watchProvider?.link ?? '',
        logoPath: request.watchProvider.logoPath,
        mediaItemId: mediaItem?.id ?? '',
        providerId: 0,
        updatedAt: new Date(),
        tmdbId: 0,
        providerName: DEFAULT_WATCH_PROVIDER_NAME
      };

      await prisma.mediaWatchProvider.create({data: watchProvider});
      watchProviders.push(watchProvider);
    }
    
    let videos: MediaAdditionalItem[] = [];
    if (request.additionalVideos?.length) {
      for(let index = 0; index < request.additionalVideos?.length; index++) {
        const add = request?.additionalVideos[index];
        let item: MediaAdditionalItem = {
          createdAt: new Date(),
          id: v4(),
          key: add.key,
          mediaItemId: mediaItem?.id ?? '',
          name: add.name ?? "",
          site: add.site ?? TMDBAdditionalSiteEnum.CLIX,
          tmdbId: mediaItem?.tmdbId ?? 0,
          active: add.active,
          source: add.source ?? MediaDetailSourceEnum.CLIX,
          isSelected: add.isSelected ?? false,
          updatedAt: new Date(),
          mostPopular: add.isSelected ?? false,
          type: '',
          thumbnailUrl: await getThumbnailUrl(add.site ?? TMDBAdditionalSiteEnum.CLIX, add.key)
        };
        videos.push(item);
      }
    }
    

    if (request.id) {
      await prisma.mediaAdditionalItem.deleteMany({
        where: {
          mediaItemId: request.id
        }
      });
    }
   

    if (videos.length) {    
      if (!videos.some(x => !!x.isSelected)) {
        const videoSelected = videos.map(vid => {
          const item = {
            id: vid.id,
            displayOrder: transformMediaDisplayOrder(vid.name, vid.source ?? MediaDetailSourceEnum.CLIX, vid.mostPopular ?? false, vid.isSelected ?? false)
          };
          return item;
        })?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder})[0];

        if (videoSelected) {
          videos.forEach(vid => {
            if (vid.id === videoSelected.id) {
              vid.isSelected = true;
            }
          })
        }        
      }
      await prisma.mediaAdditionalItem.createMany({data: videos});
    }
        
    const redisVideos = transformRedisTitleVideos(videos);
    const posterPath = request.posterPath && request.posterPath !== ''
      ? request.posterPath 
      : mediaItem?.posterPath ?? "";

    const genreArrs: string[] = [];
    let redisMediaItem: IRedisMediaItemInfo = {
      active: mediaItem?.active ?? false,
      backdropPath: mediaItem?.backdropPath ?? "",
      posterPath: posterPath,
      id: mediaItem?.id ?? '',
      genres: genreArrs,
      genre: genreArrs[0],
      watchProvider: transformSelectedWatchProvider(watchProviders),
      videos: redisVideos,
      name: request.name ?? '',
      mediaType: request.ads3rdUrl ? TMDBMediaTypeEnum.ADS: TMDBMediaTypeEnum.PROMOS,
      score: SCORE_DEFAULT,
      clixScore: undefined,
      ads3rdUrl: request.ads3rdUrl ?? ''
    };

    const configuration = await metaDataService.getConfiguration();
    if (redisMediaItem.backdropPath && !isAbsolutePath(redisMediaItem.backdropPath)) {
      redisMediaItem.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.backdropPath}`;
    }
    if (redisMediaItem.posterPath && !isAbsolutePath(redisMediaItem.posterPath)) {
      redisMediaItem.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.posterPath}`;
    }

    await redisService.updateMediaInListName(redisMediaItem);

    return mediaItem?.id;
  };
  
}

export const syncRecommendations = async (mediaItemIds: string[]) => {
  emitter.emit(CMSEventEnum.SYNC_RECOMMENDATIONS, mediaItemIds);
};

const promoAdsService = new PromoAdsService();

export default promoAdsService;
