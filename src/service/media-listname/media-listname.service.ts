import { IBaseResponse } from "@/model/common/tmdp-response";import prisma from "@/utils/prisma.util";
import { MediaAdditionalItem, MediaItem, MediaListName, MediaListNameItem, MediaWatchProvider, Prisma } from "@prisma/client";
import { IListNameChangeOrderRequest, IMediaListNameInfo, IUpdateMediaListNameRequest } from "@/model/media-list/media-list.name";
import { IMediaShortInfo, IMediaWatchProviderInfo } from "@/model/media/media";
import { v4 } from "uuid";
import { convertToTmdbScore, isAbsolutePath } from "@/utils/common.util";
import { accountService, mediaTmdbSyncService, metaDataService, redisService } from "@/service";
import { MediaDetailSourceEnum, TMDBSizeEnum } from "@/utils/enum";
import { IConfiguration } from "@/model/metadata/configuration";
import { IRedisMediaAdditionalInfo, IRedisMediaItemInfo, IRedisMediaListNameInfo, IRedisMediaWatchProviderInfo } from "@/model/redis/redis-media-list.name";
import { transformGameMedia, transformMediaDisplayOrder, transformRedisTitleVideos, transformSelectedWatchProvider, transformTrailerMedia, transformWatchProviders } from "@/transform/media.transform";
import { SCORE_DEFAULT } from "@/utils/constant.util";
import { getBackgroundProvider } from "@/mapping/streamer-image.logo";

class MediaListNameService {
  
  readonly DEFAULT_PAGE_SIZE = 100;

  public getRedisListNameByToken = async(token: string): Promise<IRedisMediaListNameInfo[]> => {
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return [];
    }

    const where: Prisma.UserStreamerWhereInput = {
      userId: provider.userId
    };

    const userStreamers = await prisma.userStreamer.findMany({ where  });
    const userStreamerIds = userStreamers.map(x => x.providerId);

    if (!userStreamerIds?.length) {
      return [];
    }

    let results = await redisService.getMediaListNames();  
    results = results.filter(x => x.active);

    results.forEach(lst => {
      lst.mediaItems = lst.mediaItems?.filter(itm => itm.active );
    });

    return results;
  }

  public syncListNameRedis = async(): Promise<void> => {
    const response = await this.getListNames(1, '');
    
    const allWatchProviders = await prisma.mediaWatchProvider.findMany();
    const allAdditionalVideos = await prisma.mediaAdditionalItem.findMany({where: {active: true}});

    await redisService.resetMediaList();

    for(var index = 0; index < response.results.length; index ++) {
      const listName = response.results[index];

      let redisItem: IRedisMediaListNameInfo = {
        active: listName.active,
        id: listName.id,
        name: listName.name,
        description: listName.description,
        displayOrder: index + 1,
        mediaItems: listName.mediaItems?.map(mediaItem => {
          let watchProviders = allWatchProviders.filter(x => x.mediaItemId === mediaItem.id);

          const videos = allAdditionalVideos
          .filter(x => x.mediaItemId === mediaItem.id && x.active);
          
          let redisMedia: IRedisMediaItemInfo = {
            active: mediaItem.active,
            backdropPath: mediaItem.backdropPath,
            id: mediaItem.id ?? '',
            posterPath: mediaItem.posterPath,
            genres: mediaItem.genres ?? [],
            genre: mediaItem.genres?.[0] ?? '',
            videos: transformRedisTitleVideos(videos),
            watchProvider: transformSelectedWatchProvider(watchProviders),
            name: mediaItem.name,
            mediaType: mediaItem.mediaType,
            score: SCORE_DEFAULT,
            clixScore: convertToTmdbScore(mediaItem.voteAverage),
            ads3rdUrl: mediaItem.ads3rdUrl ?? '',
            customReleaseDate: mediaItem.customReleaseDate ?? undefined
          };
          return redisMedia;
        })
      }

      await redisService.upsertMediaListName(redisItem);
      // await redisService.upsertMediaListName(redisItem);
    }
    
  }
  
  public getListNames = async (page: number, query: string): Promise<IBaseResponse<IMediaListNameInfo>> => {
    let result: IBaseResponse<IMediaListNameInfo> = {
      page: page,
      results: [],
      totalPages: 0,
      totalResults: 0
    };

    const total = await this.countMediaLists(query);
    result.totalResults = total;
    result.totalPages = total % this.DEFAULT_PAGE_SIZE == 0 
        ? total/this.DEFAULT_PAGE_SIZE 
        : ~~(total/this.DEFAULT_PAGE_SIZE) + 1;

    if( (page - 1) * this.DEFAULT_PAGE_SIZE >= total) {
      return result;
    }

    const skip = (page - 1) * this.DEFAULT_PAGE_SIZE;       
    const include: Prisma.MediaListNameInclude = {
      mediaListNameItems: {
        include: {
          mediaItem: true
        }
      },
    };

    const configuration = await metaDataService.getConfiguration();

    const mediaListDbs = await prisma.mediaListName.findMany({ 
      where: this.whereConditionListName(query), 
      include,
      skip, 
      take: this.DEFAULT_PAGE_SIZE, 
      orderBy: {  displayOrder: "asc"}
     });

    

    result.results = mediaListDbs.map(mediaListNamedb => {
      let mediaListName: MediaListName = Object.assign({}, mediaListNamedb);
      let mediaListNameItems = mediaListNamedb.mediaListNameItems ?? [];
      let item = this.transformMediaListNameDbToInfo(mediaListName, mediaListNameItems, configuration);
      
      return item;
    });

    let mediaItemIds = result.results.flatMap(x => x.mediaItems).map(x => x?.id ?? '');
    mediaItemIds = Array.from(new Set(mediaItemIds));
    const tmdbMediaItemChanges = await mediaTmdbSyncService.getTmdbChangeByTitleIds(mediaItemIds);

    result.results.forEach(listName => {
      listName.mediaItems?.forEach(mediaItem => {
        const hasInChangeList = tmdbMediaItemChanges.some(x => x.mediaItemId === mediaItem.id);
        mediaItem.hasTmdbChange = hasInChangeList;
      })

      listName.hasTmdbChange = listName.mediaItems?.some(x => x.hasTmdbChange);
    });
    
    result.totalPages = total % this.DEFAULT_PAGE_SIZE == 0 
        ? total/this.DEFAULT_PAGE_SIZE 
        : ~~(total/this.DEFAULT_PAGE_SIZE) + 1;

        

    return result;
  };

  public checkListNameValid =async (name: string): Promise<boolean> => {
    const listName = await prisma.mediaListName.findFirst({where: {name: name}});
    return listName === null;
  }


  public updateVisibleMediaListName =async (id: string, isVisible: boolean): Promise<void> => {
    const update: Prisma.MediaListNameUpdateArgs = {
      where: {
        id: id
      },
      data: {
        active: isVisible,
        updatedAt: new Date()
      }
    };
    
    await prisma.mediaListName.update(update);

    await redisService.updateVisibleMediaListName(id, isVisible);
    // await redisService.updateVisibleMediaListName(id, isVisible);
  }

  public deleteMediaListNameByIds =async (ids: string[]): Promise<void> => {    
    const whereListNameItem: Prisma.MediaListNameItemWhereInput = {
      mediaListNameId: {
        in: ids
      }
    };
    await prisma.mediaListNameItem.deleteMany({ where: whereListNameItem });

    const whereListName: Prisma.MediaListNameWhereInput = {
      id: {
        in: ids
      }
    };
    await prisma.mediaListName.deleteMany({ where: whereListName });

    await redisService.deleteMediaListByIds(ids);
    // await redisService.deleteMediaListByIds(ids);
  }

  public upsertMediaListName = async (payload: IUpdateMediaListNameRequest): Promise<IMediaListNameInfo | null> =>  {
    payload.mediaItemIds = payload.mediaItemIds ?? [];
    const id = payload.id;
    const isUpdate = !!id;
    
    let mediaListName: MediaListName | null;
    if (isUpdate) {
      const where: Prisma.MediaListNameWhereInput = { id };
      mediaListName = await prisma.mediaListName.findFirst({ 
        where
      });

      if (!mediaListName) {
        return null;
      }

      mediaListName.updatedAt = new Date();
      mediaListName.description = payload.description;
      mediaListName.name = payload.name;

      const update: Prisma.MediaListNameUpdateArgs = {
        where: { id },
        data: mediaListName
      };
      
      await prisma.mediaListName.update(update);

      await prisma.mediaListNameItem.deleteMany({
        where: {
          mediaListNameId: id
        }
      })
    } else {
      const totalList = await prisma.mediaListName.count();
      mediaListName = {
        name: payload.name,
        displayOrder: totalList + 1, 
        description: payload.description,
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: v4()
      };

      await prisma.mediaListName.create({ data: mediaListName });
    }

    if (!mediaListName) {
      return null;
    }

    let displayOrder = 0;
    const mediaListItems: MediaListNameItem[] = [];
    payload.mediaItemIds.forEach(mediaItemId => {
      let item: MediaListNameItem = {
        displayOrder: displayOrder,
        mediaItemId: mediaItemId,
        mediaListNameId: mediaListName?.id ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
        id: v4()
      };

      displayOrder++;
      mediaListItems.push(item);
    })

    await prisma.mediaListNameItem.createMany({
      data: mediaListItems
    });

     const result = await this.getListNameDetailById(mediaListName.id);

     if (result) {
      const mediaItemIds = result.mediaItems?.filter(x => x.id)?.map(x => x.id ?? "");
      
      const watchProviders = mediaItemIds?.length
        ? await prisma.mediaWatchProvider.findMany({
          where: {
            mediaItemId: {
              in: mediaItemIds
            }
          }
        })
        : [];

      const additionalVideos = mediaItemIds?.length
        ? await prisma.mediaAdditionalItem.findMany({
          where: {
            mediaItemId: {
              in: mediaItemIds
            },
            active: true
          }
        })
        : [];

      const configuration = await metaDataService.getConfiguration();
      
      const redisListName: IRedisMediaListNameInfo = this.convertListToRedisList(result, watchProviders, additionalVideos, configuration);
      
      await redisService.upsertMediaListName(redisListName);
      // await redisService.upsertMediaListName(redisListName);
        
     }
     
     return result;
  }

  public changeListOrder = async (payload: IListNameChangeOrderRequest): Promise<boolean> =>  {
    if (payload.newDisplayOrder < 1) {
      return false;
    }
    const totalList = await prisma.mediaListName.count();
    if (payload.newDisplayOrder > totalList) {
      return false;
    }

    const listName = await prisma.mediaListName.findFirst({where: {id: payload.id}});
    if (!listName || !listName.displayOrder) {
      return false;
    }

    if (listName.displayOrder && listName.displayOrder === payload.newDisplayOrder) {
      return false;
    }

    const isAscOrder = listName.displayOrder > payload.newDisplayOrder;
    if (!isAscOrder) {
      await prisma.$executeRaw`
        UPDATE MediaListName
        SET displayOrder = displayOrder - 1,
          updatedAt = UTC_DATE()
        WHERE displayOrder > ${listName.displayOrder} AND displayOrder <= ${payload.newDisplayOrder};
    `;
    } else {
      await prisma.$executeRaw`
        UPDATE MediaListName
        SET displayOrder = displayOrder + 1,
          updatedAt = UTC_DATE()
        WHERE displayOrder >= ${payload.newDisplayOrder} AND displayOrder < ${listName.displayOrder};
    `;
    }

    await prisma.$executeRaw`
        UPDATE MediaListName
        SET displayOrder = ${payload.newDisplayOrder},
          updatedAt = UTC_DATE()
        WHERE id = ${payload.id};
    `;

    await redisService.changeOrderList(payload);
    return true;
  }

  convertListToRedisList(result: IMediaListNameInfo, watchProviders: MediaWatchProvider[], additionalVideos: MediaAdditionalItem[], configuration: IConfiguration): IRedisMediaListNameInfo {
     let redisListName: IRedisMediaListNameInfo = {
      active: result.active,
      id: result.id,
      name: result.name,
      description: result.description,
      displayOrder: result.displayOrder,
      mediaItems: result.mediaItems?.map(mediaItem => {
        const redisWatchProviders = watchProviders.filter(x => x.mediaItemId === mediaItem.id).map(w => {
          let itm: IRedisMediaWatchProviderInfo = {
            logoPath: w.logoPath,
            providerId: w.providerId ?? 0,
            providerName: w.providerName,
            isSelected: w.isSelected ?? false,
            bgColor: getBackgroundProvider(w.providerId ?? 0),
            link: w.link ?? ''
          }
          return itm;
        })

        let watchProvider = redisWatchProviders.filter(x => x.isSelected)[0];
        if (!watchProvider) {
          watchProvider = redisWatchProviders?.[0];
        }
        
        const videos = additionalVideos?.filter(x => x.mediaItemId === mediaItem.id && x.active);

        let redisMediaItem: IRedisMediaItemInfo = {
          active: mediaItem.active,
          backdropPath: mediaItem.backdropPath,
          id: mediaItem.id ?? "",
          posterPath: mediaItem.posterPath,
          mediaType: mediaItem.mediaType,
          name: mediaItem.name,
          watchProvider: watchProvider,
          genres: mediaItem.genres,
          genre: mediaItem.genres?.[0] ?? '',
          score: SCORE_DEFAULT,
          clixScore: convertToTmdbScore(mediaItem.voteAverage),          
          ads3rdUrl: mediaItem.ads3rdUrl ?? '',
          videos: transformRedisTitleVideos(videos),
          customReleaseDate: mediaItem.customReleaseDate
        };
       
        
        return redisMediaItem;
      })
    };
    return redisListName;
  }

  public getListNameDetailById = async (id: string): Promise<IMediaListNameInfo | null> =>  {
    const include: Prisma.MediaListNameInclude = {
      mediaListNameItems: {
        include: {
          mediaItem: {
            include: {
              mediaWatchProviders: true
            }
          }
        }
      },
    };

    const mediaListDb = await prisma.mediaListName.findFirst({ 
      where: { id: id }, 
      include
     });

     if (!mediaListDb) {
      return null;
     }

     const configuration = await metaDataService.getConfiguration();
     let listName: MediaListName = Object.assign({}, mediaListDb);
     let listNameItems = mediaListDb.mediaListNameItems ?? [];
     let result = this.transformMediaListNameDbToInfo(listName, listNameItems, configuration);
     const mediaItemIds = result.mediaItems?.map(x => x.id ?? '');
     const tmdbMediaItemChanges = await mediaTmdbSyncService.getTmdbChangeByTitleIds(mediaItemIds ?? []);
     result.mediaItems?.forEach(mediaItem => {
      mediaItem.hasTmdbChange = tmdbMediaItemChanges.some(x => x.mediaItemId === mediaItem.id);
     })
     result.hasTmdbChange = result.mediaItems?.some(x => x.hasTmdbChange);
     
     return result;
  }
  
  private transformMediaListNameDbToInfo= (mediaListName: MediaListName, mediaListNameItems: MediaListNameItem[], configuration: IConfiguration) : IMediaListNameInfo=> {
    let item: IMediaListNameInfo = {
      active: mediaListName.active,
      description: mediaListName.description ?? "",
      id: mediaListName.id,
      name: mediaListName.name,
      createdAt: mediaListName.createdAt,
      displayOrder: mediaListName.displayOrder ?? 0,
      mediaItems: mediaListNameItems
          ?.sort(function(a,b) {return a.displayOrder - b.displayOrder})
          .map((mediaListNameItem: any) => {
          const media: MediaItem = mediaListNameItem.mediaItem;
          const watchProviders: MediaWatchProvider[] = mediaListNameItem.mediaItem?.mediaWatchProviders ?? [];

          let mediaItem: IMediaShortInfo = {
            backdropPath: media.backdropPath ?? "",
            mediaType: media.mediaType,
            name: media.name,
            overview: media.overview ?? "",
            posterPath: media.posterPath ?? "",
            releaseDate: media.releaseDate ?? undefined,
            tmdbId: media.tmdbId,
            genres: JSON.parse(media.genres ?? "[]"),
            active: media.active,
            id: media.id,
            tags: JSON.parse(media.tags ?? "[]"),
            score: SCORE_DEFAULT,
            voteAverage: media.voteAverage ?? undefined,
            clixScore: convertToTmdbScore(media.voteAverage),
            createdAt: media.createdAt,
            ads3rdUrl: media.ads3rdUrl ?? '',
            customReleaseDate: media.customReleaseDate ?? undefined
          }

          if (mediaItem.backdropPath && !isAbsolutePath(mediaItem.backdropPath)) {
            mediaItem.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${mediaItem.backdropPath}`;
          }
          if (mediaItem.posterPath && !isAbsolutePath(mediaItem.posterPath)) {
            mediaItem.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${mediaItem.posterPath}`;
          }

          if (watchProviders && watchProviders?.length) {
            mediaItem.watchProviders = watchProviders.map(watch => {
              let item: IMediaWatchProviderInfo = {
                id: watch.id,
                link: watch.link,
                logoPath: watch.logoPath,
                providerId: watch.providerId,
                providerName: watch.providerName,
                isSelected: watch.isSelected ?? false
              };
              if (item.logoPath && !isAbsolutePath(item.logoPath)) {
                item.logoPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.logoPath}`;
              }
              return item;
            });

            let watchProvider: IMediaWatchProviderInfo|undefined = mediaItem.watchProviders?.filter(x => x.isSelected)[0];
            if (!watchProvider) {
              watchProvider = mediaItem.watchProviders?.[0];
            }

            if (watchProvider) {
              mediaItem.watchProvider = {
                isSelected: true,
                logoPath: watchProvider.logoPath,
                providerId: watchProvider.providerId ?? 0,
                providerName: watchProvider.providerName ?? '',
                bgColor: getBackgroundProvider(watchProvider.providerId ?? 0),
                link: watchProvider.link ?? ''
              };
            }
          }

          return mediaItem;
        }),
    };
    
    return item;
  }
  private countMediaLists =async (query: string): Promise<number> => {
    query = query ?? "";
    const total = await prisma.mediaListName.count({  where: this.whereConditionListName(query)  });
     
     return total;
  }

  private whereConditionListName = (query: string): Prisma.MediaListNameWhereInput => {
    query = query ?? "";
    const where: Prisma.MediaListNameWhereInput = {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        {
          mediaListNameItems: { 
            some: {      
              mediaItem: {
                OR: [
                  { name: { contains: query } },
                  { overview: { contains: query } }
                ]
              }     
            }
           } 
        }
      ]
    };

    return where;
  }
  
}

const mediaListNameService = new MediaListNameService();

export default mediaListNameService;
