export interface IWatchProviderSubItemApiResponse {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface IWatchProviderSubItemResponse {
  displayPriority: number;
  logoPath: string;
  providerId: number;
  providerName: string;
}

export interface IWatchProviderItemApiResponse {
  link: string;
  flatrate: IWatchProviderSubItemApiResponse[];
  rent: IWatchProviderSubItemApiResponse[];
  buy: IWatchProviderSubItemApiResponse[];
}

export interface IWatchProviderItemResponse {
  link: string;
  flatrate: IWatchProviderSubItemResponse[];
  rent: IWatchProviderSubItemResponse[];
  buy: IWatchProviderSubItemResponse[];
}

export interface IWatchProviderApiResponse {
  id: number;
  results: {
    [key: string]: IWatchProviderItemApiResponse;
  };
}

export interface IWatchProviderResponse {
  id: number;
  results: {
    [key: string]: IWatchProviderItemResponse;
  };
}

export interface IGetWatchProviderByTitleIdPayload {
  tmdbId: number;
  providerId: string;
}
