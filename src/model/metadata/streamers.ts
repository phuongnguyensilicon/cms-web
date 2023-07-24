export interface ITmdbStreamerResponse {
  results: ITmdbStreamer[];
}

export interface ITmdbStreamer {
  display_priorities?: ITmdbStreamerDisplay;
  logo_path: string;
  provider_name: string;
  provider_id: number;
}

export interface IRedisStreamer {
  logoPath: string;
  logoUpdatePath?: string;
  providerName: string;
  providerId: number;
}


export interface ITmdbStreamerDisplay {
  US: number;
}
