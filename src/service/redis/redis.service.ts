import { IListNameChangeOrderRequest } from "@/model/media-list/media-list.name";
import { IRedisMediaItemInfo, IRedisMediaListNameInfo } from "@/model/redis/redis-media-list.name";
import { slugify } from "@/utils/common.util";
import { createRedisConnection } from "@/utils/redisUtil";

class RedisService {
  readonly MEDIA_LIST_NAME_KEY = "MEDIA_LIST_NAME";
  readonly MEDIA_LIST_FIELD_NAME = "LIST";

  redis = createRedisConnection();

  
  public getMediaListNames = async (): Promise<IRedisMediaListNameInfo[]> => {
    const json = await this.redis.hget(this.MEDIA_LIST_NAME_KEY, this.MEDIA_LIST_FIELD_NAME);
    if (!json) {
      return [];
    }

    let result: IRedisMediaListNameInfo[] = JSON.parse(json);
    result.forEach(lstName => {
      lstName.slug = slugify(lstName.name);
    })
    return result;
  };

  public removeMediaListNameById = async (id: string): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();
    result = result.filter(item => item.id === id);
    
    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  };

  public removeMediaInListById = async (id: string): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();
    result.forEach(item => {
      item.mediaItems = item.mediaItems?.filter(mediaItem => mediaItem.id === id);
    });

    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  };

  public upsertMediaListName = async (listName: IRedisMediaListNameInfo): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result = result.filter(item => item.id !== listName.id);
    result.push(listName);

    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  
  };

  public changeOrderList = async (payload: IListNameChangeOrderRequest): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    const listName = result.filter(item => item.id === payload.id)[0];
    if (!listName) {
      return;
    }
    const isAscOrder = listName.displayOrder > payload.newDisplayOrder;

    result.forEach(item => {
      if (item.id !== payload.id) {
        if (!isAscOrder) {
          if (item.displayOrder > listName.displayOrder && item.displayOrder <= payload.newDisplayOrder) {
            item.displayOrder -= 1;
          }
        }
        else {
          if (item.displayOrder >= payload.newDisplayOrder && item.displayOrder < listName.displayOrder) {
            item.displayOrder += 1;
          }
        }
      }       
    });

    result.filter(item => item.id === payload.id).forEach(item => {
      item.displayOrder = payload.newDisplayOrder;  
    });  
  
    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  
  };

  public updateMediaInListName = async (mediaItem: IRedisMediaItemInfo): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result.forEach(item => {
      item.mediaItems?.forEach(redisMediaItem => {
        if (redisMediaItem.id === mediaItem.id) {
          redisMediaItem.active = mediaItem.active;
          redisMediaItem.backdropPath = mediaItem.backdropPath ?? redisMediaItem.backdropPath;
          redisMediaItem.posterPath = mediaItem.posterPath ?? redisMediaItem.posterPath;
          redisMediaItem.watchProvider = mediaItem.watchProvider;
          redisMediaItem.genres = mediaItem.genres;
          redisMediaItem.name = mediaItem.name;
          redisMediaItem.mediaType = mediaItem.mediaType;
          redisMediaItem.ads3rdUrl = mediaItem.ads3rdUrl ?? '';
          redisMediaItem.videos = mediaItem.videos;
          redisMediaItem.customReleaseDate = mediaItem.customReleaseDate;
        }
      })
    });

    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
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

    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  };

  public updateVisibleMediaListName = async (id: string, active: boolean): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result.forEach(item => {
      if (item.id == id) {
        item.active = active;
      }
    });

    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  };

  public deleteMediaInListByIds = async (ids: string[]): Promise<void> => {
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();

    result.forEach(item => {
      item.mediaItems = item.mediaItems ?? [];
      item.mediaItems = item.mediaItems.filter(itm => !ids.includes(itm.id));
    });

    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  };

  public deleteMediaListByIds = async (ids: string[]): Promise<void> => {
    if (!ids?.length) {
      return;
    }
    let result: IRedisMediaListNameInfo[] = await this.getMediaListNames();
    result = result.filter(itm => !ids.includes(itm.id));

    await this.updateMediaValue(this.MEDIA_LIST_NAME_KEY, result);
  };

  public setRedisValue = async(key: string, data: any): Promise<void> => {
    await this.redis.hset(key, this.MEDIA_LIST_FIELD_NAME, JSON.stringify(data));
  }

  public updateMediaValue = async(key: string, data: any): Promise<void> => {
    await this.redis.hdel(this.MEDIA_LIST_NAME_KEY, this.MEDIA_LIST_FIELD_NAME);
    await this.redis.hincrby(this.MEDIA_LIST_NAME_KEY, this.MEDIA_LIST_FIELD_NAME, 1);
    await this.setRedisValue(this.MEDIA_LIST_NAME_KEY, data);
  }
  public resetMediaList = async(): Promise<void> => {
    await this.redis.hdel(this.MEDIA_LIST_NAME_KEY, this.MEDIA_LIST_FIELD_NAME);
  }
}



const redisService = new RedisService();

export default redisService;
