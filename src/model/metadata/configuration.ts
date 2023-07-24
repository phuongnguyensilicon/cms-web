
export interface IConfiguration {
  images: IConfigurationImage;
}


export interface IConfigurationImage {
  base_url: string;
  secure_base_url: string;
  logo_sizes: string[];
  poster_sizes: string[];
  profile_sizes: string[];
  still_sizes: string[];
}