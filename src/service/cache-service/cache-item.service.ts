import { IRedisMediaItemInfo, IRedisMediaListNameInfo } from "@/model/redis/redis-media-list.name";
import prisma from "@/utils/prisma.util";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

class CacheItemService {
  readonly MEDIA_LIST_NAME_KEY = "MEDIA_LIST_NAME";

  public resetMediaListCacheValue = async(data: any): Promise<void> => {
    var mediaListCacheItem = await prisma.cacheItem.findFirst({
      where: {
        key: this.MEDIA_LIST_NAME_KEY
      }
    });

    const jsonVal = data ? JSON.stringify(data): '';
    if (!mediaListCacheItem) {
      mediaListCacheItem = {
        createdAt: new Date(),
        id: v4(),
        key: this.MEDIA_LIST_NAME_KEY,
        updatedAt: new Date(),
        value: jsonVal
      };
      await prisma.cacheItem.create({data: mediaListCacheItem});
    } else {
      const update: Prisma.CacheItemUpdateArgs = {
        where: {
          id: mediaListCacheItem.id
        },
        data: {
          value: jsonVal,
          updatedAt: new Date()
        }
      };
      
      await prisma.cacheItem.update(update);
    }
  }

  public resetMediaList = async(): Promise<void> => {
    await this.resetMediaListCacheValue(null);
  }
  
  public getMediaListNames = async (): Promise<IRedisMediaListNameInfo[]> => {
    var mediaListCacheItem = await prisma.cacheItem.findFirst({
      where: {
        key: this.MEDIA_LIST_NAME_KEY
      }
    });

    const json = mediaListCacheItem?.value;
    if (!json) {
      return [];
    }

    const result: IRedisMediaListNameInfo[] = JSON.parse(json);
    return result;
  };

  public removeMediaListNameById = async (id: string): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();
    result = result.filter(item => item.id === id);
    
    await this.resetMediaListCacheValue(result);
  };

  public removeMediaInListById = async (id: string): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();
    result.forEach(item => {
      item.mediaItems = item.mediaItems?.filter(mediaItem => mediaItem.id === id);
    });

    await this.resetMediaListCacheValue(result);
  };

  public upsertMediaListName = async (listName: IRedisMediaListNameInfo): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result = result.filter(item => item.id !== listName.id);
    result.push(listName);

    await this.resetMediaListCacheValue(result);
  };

  public updateMediaInListName = async (mediaItem: IRedisMediaItemInfo): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result.forEach(item => {
      item.mediaItems?.forEach(redisMediaItem => {
        if (redisMediaItem.id === mediaItem.id) {
          redisMediaItem.active = mediaItem.active;
          redisMediaItem.backdropPath = mediaItem.backdropPath;
          redisMediaItem.posterPath = mediaItem.posterPath;
          redisMediaItem.watchProvider = mediaItem.watchProvider;
        }
      })
    });

    await this.resetMediaListCacheValue(result);
  };

  public updateVisibleMediaInListName = async (mediaItemId: string, active: boolean): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result.forEach(item => {
      item.mediaItems?.forEach(redisMediaItem => {
        if (redisMediaItem.id === mediaItemId) {
          redisMediaItem.active = active;
        }
      })
    });

    await this.resetMediaListCacheValue(result);
  };

  public updateVisibleMediaListName = async (id: string, active: boolean): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result.forEach(item => {
      if (item.id == id) {
        item.active = active;
      }
    });

    await this.resetMediaListCacheValue(result);
  };

  public deleteMediaInListByIds = async (ids: string[]): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result.forEach(item => {
      item.mediaItems = item.mediaItems ?? [];
      item.mediaItems = item.mediaItems.filter(itm => !ids.includes(itm.id));
    });

    await this.resetMediaListCacheValue(result);
  };

  public deleteMediaListByIds = async (ids: string[]): Promise<void> => {
    if (!ids?.length) {
      return;
    }
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();
    result = result.filter(itm => !ids.includes(itm.id));

    await this.resetMediaListCacheValue(result);
  };  
}



const cacheItemService = new CacheItemService();

export default cacheItemService;
