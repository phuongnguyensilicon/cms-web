import { IConfiguration } from "@/model/metadata/configuration";
import { IRedisStreamer } from "@/model/metadata/streamers";
import { IRedisMediaWatchProviderInfo } from "@/model/redis/redis-media-list.name";
import { isAbsolutePath } from "@/utils/common.util";
import { TMDBSizeEnum } from "@/utils/enum";

export const THEATRES_PROVIDER_ID = -1;
export const THEATRES_COMMING_PROVIDER_ID = -2;
export const streamerLogoPaths: any[] = [
  {
    key: 192, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}YouTube.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 457, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Vix.svg`, bgColor: '#FF5901'
  },
  {
    key: 99, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Shudder.svg`, bgColor: '#000000'
  },
  {
    key: 37, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Showtime.svg`, bgColor: '#98151C'
  },
  {
    key: 1875, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Runtime.svg`, bgColor: '#1F1F1F'
  },
  {
    key: 279, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}RedBox.svg`, bgColor: '#DD213A'
  },
  {
    key: 300, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}PlutoTV.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 386, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Peacock.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 11, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Mubi.svg`, bgColor: '#037865'
  },
  {
    key: 34, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}MGM-Plus-2.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 212, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Hoopla.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 3, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}GooglePlay.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 257, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}FuboTV.svg`, bgColor: '#FA4516'
  },
  {
    key: 613, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Freevee.svg`, bgColor: '#331B53'
  },
  {
    key: 283, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Crunchyroll.svg`, bgColor: '#F47521'
  },
  {
    key: 151, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Britbox.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 526, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}AMC-Plus.svg`, bgColor: '#000000'
  },
  {
    key: 529, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Arrow.svg`, bgColor: '#000000'
  },
  {
    key: 87, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}AcornTV.svg`, bgColor: '#0D1630'
  },
  {
    key: 350, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}AppleTV-Plus.svg`, bgColor: '#FFFFFF'
  },
  {
    key: 337, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Disney-Plus.svg`, bgColor: '#0E2278'
  },
  {
    key: 1899, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Max.svg`, bgColor: '#0033FE'
  },
  {
    key: 384, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Max.svg`, bgColor: '#0033FE'
  },
  {
    key: 616, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Max.svg`, bgColor: '#0033FE'
  },
  {
    key: 15, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Hulu-n.svg`, bgColor: '#1CE783'
  },
  {
    key: 8, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Netflix-n.svg`, bgColor: '#E31019'
  },
  {
    key: 531, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Paramount-Plus.svg`, bgColor: '#0057FF'
  },
  {
    key: 9, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}Prime-Video.svg`, bgColor: '#098FBD'
  },
  {
    key: 0, value: `${process.env.AWS_S3_CLOUND_FRONT_URL}default_n.svg`, bgColor: '#0b1b5f'
  }
];

export const THEATRES_PROVIDER: IRedisStreamer = {
  logoPath: `${process.env.AWS_S3_CLOUND_FRONT_URL}Theatres-Admin-3.svg`,
  providerName: 'In Theatres',
  providerId: THEATRES_PROVIDER_ID,
  logoUpdatePath: `${process.env.AWS_S3_CLOUND_FRONT_URL}Theatres-3.svg`
}

export const THEATRES_COMMING_PROVIDER: IRedisStreamer = {
  logoPath: `${process.env.AWS_S3_CLOUND_FRONT_URL}Theatres-Comming-Admin.svg`,
  providerName: 'Coming Soon',
  providerId: THEATRES_COMMING_PROVIDER_ID,
  logoUpdatePath: `${process.env.AWS_S3_CLOUND_FRONT_URL}Theatres-Comming.svg`
}

export function convertStreamerLogo(logoPath: string, providerId: number, configuration: IConfiguration, isKeepLogo?: boolean): string {
  logoPath = logoPath ?? '';
  if (isAbsolutePath(logoPath)) {
    return logoPath;
  }

  if (!!isKeepLogo && logoPath) {
    if (!isAbsolutePath(logoPath)) {
      return  `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${logoPath}`;
    }
    return logoPath;
  }

  const item = streamerLogoPaths.filter(x => x.key === providerId)[0];
  let logo = item?.value;
  if (!logo) {
    logo = streamerLogoPaths.filter(x => x.key === 0)[0].value;    
  }

  if (!isAbsolutePath(logo)) {
    logo = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${logoPath}`;
  }
  return logo;
}

export function getBackgroundProvider(providerId: number): string {
  const item = streamerLogoPaths.filter(x => x.key === providerId)[0];
  let bgColor = item?.bgColor;
  if (!bgColor) {
    bgColor = streamerLogoPaths.filter(x => x.key === 0)[0].bgColor;
    // logo = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${logoPath}`
  }
  return bgColor;
}

export function createDefaultWatchProvider(configuration: IConfiguration): IRedisMediaWatchProviderInfo {
  const item: IRedisMediaWatchProviderInfo = {
    logoPath: convertStreamerLogo('', 0, configuration),
    providerName: '',
    providerId: 0,
    isSelected: false,
    bgColor: getBackgroundProvider(0),
    link: ''
  };

  return item;
}


export function convertLogoPath(logoUpdatePath?: string): string {
  if (logoUpdatePath) {
    return logoUpdatePath;
  }

  const defaultLogo = streamerLogoPaths.filter(x => x.key === 0)[0].value;

  return defaultLogo;
}