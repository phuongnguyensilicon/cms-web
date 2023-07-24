import { IBaseResponse } from "@/model/common/tmdp-response";import prisma from "@/utils/prisma.util";
import { MediaAdditionalItem, MediaItem, MediaListName, MediaListNameItem, MediaWatchProvider, Prisma } from "@prisma/client";
import { IListNameChangeOrderRequest, IMediaListNameInfo, IUpdateMediaListNameRequest } from "@/model/media-list/media-list.name";
import { IMediaAdditionalRequest, IMediaShortInfo, IMediaWatchProviderInfo } from "@/model/media/media";
import { v4 } from "uuid";
import { convertToTmdbScore, isAbsolutePath } from "@/utils/common.util";
import { accountService, mediaListNameService, mediaService, metaDataService, redisService } from "@/service";
import { MediaDetailSourceEnum, TMDBMediaTypeEnum, TMDBSizeEnum } from "@/utils/enum";
import { IConfiguration } from "@/model/metadata/configuration";
import { IRedisMediaAdditionalInfo, IRedisMediaItemInfo, IRedisMediaListNameInfo, IRedisMediaWatchProviderInfo } from "@/model/redis/redis-media-list.name";
import { transformMediaDisplayOrder, transformRedisTitleVideos, transformSelectedWatchProvider, transformTrailerMedia, transformWatchProviders } from "@/transform/media.transform";
import { SCORE_DEFAULT } from "@/utils/constant.util";
import { getBackgroundProvider } from "@/mapping/streamer-image.logo";

class SyncService {
  
  public syncMedias = async(isProcessForList: boolean, isSyncVideo: boolean, isSyncCredit: boolean): Promise<void> => {
    let pageSize = isSyncCredit ? 2 : 100;
    let pageIndex = 0;

    if (isProcessForList) {
      let mediaItemIds: string[] = [];
      const lists = await redisService.getMediaListNames();
      lists.forEach(lst => {
        lst.mediaItems?.forEach(m => {
          if (!mediaItemIds.some(x => x == m.id)) {
            mediaItemIds.push(m.id);
          };
        })
      })

      for (let i = 0; i < mediaItemIds.length; i += pageSize) {
          const subMediaItemIds = mediaItemIds.slice(i, i + pageSize);
          const mediaItems = await prisma.mediaItem.findMany({
            where: {
              id: {
                in: subMediaItemIds
              }
            },
            include: {
              mediaAdditionalItems: true
            }
          })

          if (isSyncVideo) {
            await this.runSyncVideoTask(mediaItems);
          }
  
          if (isSyncCredit) {
            await this.runSyncCreditTask(mediaItems);
          }
      }
    } else {
      while(true)
      {
        const mediaItems = await prisma.mediaItem.findMany({
            include: {
              mediaAdditionalItems: true
            },
            take: pageSize,
            skip: pageIndex * pageSize
          });
        if (!mediaItems.length) {
          break;
        }
  
        pageIndex++;
  
        if (isSyncVideo) {
          await this.runSyncVideoTask(mediaItems);
        }

        if (isSyncCredit) {
          await this.runSyncCreditTask(mediaItems);
        }
        
  
        if (isProcessForList) {
          break;
        }
      }
    }
    
    await mediaListNameService.syncListNameRedis();
  }

  public syncCreditsById = async(mediaItemId: string): Promise<void> => {
    const mediaItem = await prisma.mediaItem.findFirst({where: {id: mediaItemId}});
    if (!mediaItem || mediaItem.tmdbId <= 0) {
      return;
    }
    await mediaService.updateMediaCredits(mediaItem);
  }
  
  private runSyncVideoTask = async(mediaItems: any[]): Promise<void> => {
    const tasks = mediaItems.map(mediaItem => {
      const additionalItems = mediaItem.mediaAdditionalItems ?? [];
      const videoRequests:IMediaAdditionalRequest[] = additionalItems.map((add: any) => {
        const request: IMediaAdditionalRequest = {
          active: add.active,
          key: add.key,
          name: add.name,
          source: add.source ?? '',
          isSelected: add.isSelected ?? false,
          site: add.site,
        };
        return request;
      });
      
      return mediaService.updateMediaAdditionalVideos(mediaItem, videoRequests);
    })

    await Promise.all(tasks);
  }

  private runSyncCreditTask = async(mediaItems: any[]): Promise<void> => {
    const tasks = mediaItems.map(mediaItem => {
      return mediaService.updateMediaCredits(mediaItem);
    })

    await Promise.all(tasks);
  }
}

const syncService = new SyncService();

export default syncService;
