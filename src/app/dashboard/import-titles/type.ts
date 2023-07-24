import {
  ISearchMultiPayload,
  SearchMultiResultType
} from "@/service/title/title.type";
import { TMDBMediaTypeEnum } from "@/utils/enum";

export interface ITMDBTitle {
  id: string;
  name: string;
  tmdbId: number;
  providerId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransformResultResponse {
  title: string;
  id: number;
  mediaType: TMDBMediaTypeEnum;
  image: string;
  backdropPath: string;
  releaseDate: string;
  overview: string;
  metadata: Partial<SearchMultiResultType>;
  imported: boolean;
}

export interface ITitlePageProps {
  params: { [key: string]: unknown };
  searchParams: ISearchMultiPayload;
}

export interface ITitleContainerProps {
  searchParams: ISearchMultiPayload;
  rows: ITransformResultResponse[];
  totalPages: number;
  page: number;
}

export interface ITitleSearchProps {
  query: string;
  onSearch?: (query: string) => void;
}

export interface ITitleCardProps extends ITransformResultResponse {
  checked: boolean;
  onChecked?: (id: number) => void;
}

export interface ITitlePaginationProps {
  page: number;
  totalPages: number;
  navigateToPage: (page: number) => void;
}

export interface ITitleImportProps {
  allTitleSelected?: boolean;
  titleSelected?: ITitleSelectedState;
  totalResults: number;
  hasSelected?: boolean;
  filterBy?:string;
  onToggleSelectAll?: () => void;
  handleImport?: () => void;
  toggleLoading?: (loading: boolean) => void;
}

export interface ITitleSelectedState {
  [key: number]: ITransformResultResponse;
}

export interface IUseTmdbTitleStore {
  rows: ITransformResultResponse[];
  totalPages: number;
  totalResults: number;
  page: number;
}
