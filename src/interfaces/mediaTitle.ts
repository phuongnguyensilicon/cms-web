export type MediaTitle = {
  id: string;
  name: string;
  overview: string | null;
  releaseDate: string | null;
  tmdbId: number;
  mediaType: string;
  active: boolean;
  posterPath: string | null;
  backdropPath: string | null;
  genres: string | null;
  tags: string | null;
  status: any;
  voteAverage: number | null;
  runtime: number | null;
  numberEpisodes: number | null;
  numberSeasons: number | null;
  createdAt: string;
  updatedAt: string;
  streamerLogo?: string;
  watchProvider?: any;
  ratingOptions?: any[];
  clixScore?: number;
  videos?: any;
  customReleaseDate?: string;
};

export interface CardBoard {
  id: string;
  genre: string;
  totalPending: number;
  total: number;
  completePercentage: number;
}

export type TitleType = 'promos' | 'tv' | 'movie';

export type VideoType = 'trailer' | 'game';
