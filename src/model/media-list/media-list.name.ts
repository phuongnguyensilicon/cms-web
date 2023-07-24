import { IMediaShortInfo } from "../media/media";

export interface IMediaListNameInfo {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
  displayOrder: number;
  mediaItems?: IMediaShortInfo[];
  hasTmdbChange?: boolean;  
}


export interface IUpdateMediaListNameRequest {
  id?: string;
  name: string;
  description: string;
  mediaItemIds: string[];
}

export interface IUpdateVisibilityRequest {
  id: string;
  isVisibility: boolean;
}

export interface IListNameChangeOrderRequest {
  id: string;
  newDisplayOrder: number;
}