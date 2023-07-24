import { zypeInstance } from "@/utils/api.util";
import { TMDBAdditionalSiteEnum } from "@/utils/enum";
const DEFAULT_ZYPE_THUMBNAIL_WIDTH = 854;

export const host_video = [
  {
      "site": "Vimeo",
      "host": "https://vimeo.com/",
      "thumbnailUrl": "https://i.vimeocdn.com/video/{key}.jpg"
  },
  {
    "site": "Youtube",
    "host": "https://www.youtube.com/",
    "thumbnailUrl": "https://i.ytimg.com/vi/{key}/hqdefault.jpg"
  },
  {
    "site": "Clix",
    "host": "https://www.zype.com/",
    "thumbnailUrl": "https://gvthumbnail.zype.com/5c505f2e3d3f53117e000276/{key}/642d946ca47941000187fb1a/55096bb169702d070cfa2b00/00001.png"
  },
  {
    "site": "default",
    "host": "",
    "thumbnailUrl": "https://dg9kshmcs0zwc.cloudfront.net/thubnail_default.png"
  },
]

export const getThumbnailUrl = async (site: string, key: string): Promise<string> => {
  if (site === TMDBAdditionalSiteEnum.CLIX) {
    const result = await getZypeThumbnailUrl(key);
    return result.url;
  }

  let hostVideo = host_video.filter(x => x.site.toLowerCase() === site.toLowerCase())[0];  
  if (!hostVideo) {
    hostVideo = host_video.filter(x => x.site === 'default')[0];
  }

  const result = hostVideo?.thumbnailUrl.replace('{key}', key);
  return result;
}

export const getZypeThumbnailUrlByKeys = async (keys: string[]): Promise<any[]> => {
  const tasks = keys.map(key => getZypeThumbnailUrl(key));
  const results = await Promise.all(tasks);
  
  return results;
}

const getZypeThumbnailUrl = async (key: string): Promise<any> => {
  const hostVideo = host_video.filter(x => x.site === 'default')[0];
  const defaultThumbnailUrl = hostVideo.thumbnailUrl;

  try {
    const path = `/videos/${key}`;
    const { data } = await zypeInstance.get<any>(path);
  
    if (!data || !data.response?.thumbnails?.length) {
      return defaultThumbnailUrl;
    }
    let thumbnail = data.response?.thumbnails.filter((x: any) => x.width === DEFAULT_ZYPE_THUMBNAIL_WIDTH)[0];
    if (!thumbnail) {
      thumbnail = data.response?.thumbnails[0];
    }
    
    return {
      key,
      url: thumbnail.url
    };
  } catch (err){
    console.log(err);
    return {
      key,
      url: defaultThumbnailUrl
    };
  }
  
}