import { createRedisConnection } from "@/utils/redisUtil";
import { IConfiguration } from "@/model/metadata/configuration";
import { IGenre } from "@/model/metadata/genre";
import { getTmdbConfiguration, getTmdbGenre, getTmdbStreamers } from "@/utils/tmdb.util";
import { IMediaTag } from "@/model/metadata/media.tag";
import { IRedisStreamer } from "@/model/metadata/streamers";
import { THEATRES_COMMING_PROVIDER, THEATRES_PROVIDER, streamerLogoPaths } from "@/mapping/streamer-image.logo";

class MetadataService {

  readonly CONFIGURATION_KEY = "CONFIGURATION";
  readonly GENRE_KEY = "GENRE";
  readonly MEDIA_TAG_KEY = "MEDIA_TAG";
  readonly STREAMERS_KEY = "STREAMER";
  readonly EXCEPT_STREAMER_IDS: number[] = [384, 616]
 
  redis = createRedisConnection();


  public getConfiguration = async (): Promise<IConfiguration> => {
    const json = await this.redis.get(this.CONFIGURATION_KEY);
    if (!json) {
      return await this.setConfiguration();
    }
    const result: IConfiguration = JSON.parse(json);
    return result;
  };

  public getMediaTags = async (): Promise<IMediaTag[]> => {
    const json = await this.redis.get(this.MEDIA_TAG_KEY);
    if (!json) {
      return await this.initMediaTags();
    }
    const result: IMediaTag[] = JSON.parse(json);
    return result;
  };

  public updateTags = async (newTags: string[], userId?: number): Promise<void> => {
    let tagCaches = await this.getMediaTags();
    newTags = newTags.filter(t => !tagCaches.filter(x => !x.userId).map(t => t.name).includes(t));
    if (userId) {
      newTags = newTags.filter(t => !tagCaches.filter(x => x.userId === userId).map(t => t.name).includes(t));
    }
    if (!newTags.length) {
      return;
    }
    const tagImports =  newTags.map(t => {
      const item: IMediaTag = {
        name: t,
        userId: userId
      };
      return item;
    })
    tagCaches = tagCaches.concat(tagImports);

    await this.redis.del(this.MEDIA_TAG_KEY);
    await this.redis.set(this.MEDIA_TAG_KEY, JSON.stringify(tagCaches));
  };

  private initMediaTags = async (): Promise<IMediaTag[]> => {
    const tags: IMediaTag[] = [
      { name: "Drama" },
      { name: "Action" },
      { name: "Fantasy" },
      { name: "Horror" },
      { name: "Thriller" },
      { name: "Mystery" },
      { name: "Comedy" }
    ];
    await this.redis.set(this.MEDIA_TAG_KEY, JSON.stringify(tags));
    return tags;
  };

  public getGenres = async (): Promise<IGenre[]> => {
    const json = await this.redis.get(this.GENRE_KEY);
    if (!json) {
      return await this.setGenre();
    }
    const result: IGenre[] = JSON.parse(json);
    return result;
  };

  public resetStreamers = async (): Promise<IRedisStreamer[]> => {
    await this.redis.del(this.STREAMERS_KEY);
    const results = this.getStreamers();
    return results;
  };

  
  public getStreamers = async (): Promise<IRedisStreamer[]> => {
    let result: IRedisStreamer[] = [];
    const json = await this.redis.get(this.STREAMERS_KEY);
    if (!json) {
      result = await this.setStreamers();
    } else {
      result  = JSON.parse(json);
    }

    result = result.filter(item => !this.EXCEPT_STREAMER_IDS.includes(item.providerId));

    return result;
  };

  private setStreamers = async (): Promise<IRedisStreamer[]> => {
    let streamers = await getTmdbStreamers();
    streamers = streamers ?? [];
    streamers = [...streamers, THEATRES_PROVIDER, THEATRES_COMMING_PROVIDER];
    if (streamers) {
      streamers.forEach(streamer => {
        const streamLogoUpdate = streamerLogoPaths.filter(x => x.key === streamer.providerId)[0];
        if (streamLogoUpdate?.value) {
          streamer.logoUpdatePath = streamLogoUpdate.value;
        }
      })

      await this.redis.del(this.STREAMERS_KEY);
      await this.redis.set(this.STREAMERS_KEY, JSON.stringify(streamers));
    }
    return streamers;
  };

  private setGenre = async (): Promise<IGenre[]> => {
    const genres = await getTmdbGenre();
    if (genres) {
      await this.redis.del(this.GENRE_KEY);
      await this.redis.set(this.GENRE_KEY, JSON.stringify(genres));
    }
    return genres;
  };

  private setConfiguration = async (): Promise<IConfiguration> => {
    const configuration = await getTmdbConfiguration();
    if (configuration) {
      await this.redis.del(this.CONFIGURATION_KEY);
      await this.redis.set(this.CONFIGURATION_KEY, JSON.stringify(configuration));
    }
    return configuration;
  };
}

const metaDataService = new MetadataService();

export default metaDataService;
