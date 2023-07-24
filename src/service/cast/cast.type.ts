export interface ICast {
  adult: boolean;
  gender: number;
  id: number;
  knownForDepartment: string;
  name: string;
  originalName: string;
  popularity: number;
  profilePath?: string;
  character: string;
  creditId: string;
  order: number;
}

export interface ICrew {
  adult: boolean;
  gender: number;
  id: number;
  knownForDepartment: string;
  name: string;
  originalName: string;
  popularity: number;
  profilePath?: string;
  creditId: string;
  department: string;
  job: string;
}

export interface ICastApiResponse {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  character: string;
  credit_id: string;
  order: number;
}

export interface ICrewApiResponse {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  credit_id: string;
  department: string;
  job: string;
}

export interface IGetCastByTitleIdPayload {
  tmdbId: number;
  providerId: string;
}

export interface IGetCastApiResponse {
  id: number;
  cast: ICastApiResponse[];
  crew: ICrewApiResponse[];
}

export interface IGetCastResponse {
  id: number;
  cast: ICast[];
  crew: ICrew[];
}
