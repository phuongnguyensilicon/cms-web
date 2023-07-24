import { useState, useEffect } from "react";
import { titleRepository } from "@/repository";
import { HookFunction } from "@/utils/type";
import {
  ISearchMultiPayload,
  SearchMultiResultType
} from "@/service/title/title.type";
import { ITransformResultResponse, IUseTmdbTitleStore } from "./type";
import { TMDBMediaTypeEnum } from "@/utils/enum";

const transformResult = (
  item: SearchMultiResultType
): Omit<ITransformResultResponse, "imported"> => {
  let title: string = "",
    image: string = item.poster_path || "",
    backdropPath: string = "",
    releaseDate = "",
    overview = "";
  if (item.media_type === TMDBMediaTypeEnum.MOVIE) {
    title = item.title || "";
    releaseDate = item.release_date;
    backdropPath = item.backdrop_path || "";
    overview = item.overview;
  }

  if (item.media_type === TMDBMediaTypeEnum.TV) {
    title = item.name || "";
    releaseDate = item.first_air_date;
    backdropPath = item.backdrop_path || "";
    overview = item.overview;
  }

  return {
    title,
    id: item.id,
    mediaType: item.media_type,
    image,
    backdropPath,
    releaseDate,
    overview,
    metadata: item
  };
};

type UseTmdbTitleType = HookFunction<
  IUseTmdbTitleStore,
  {
    fetchTmdbTitle: () => Promise<void>;
    setTmdbTitleQuery: (query: Partial<ISearchMultiPayload>) => void;
    reload: () => void;
  }
>;

const useTmdbTitle = (): UseTmdbTitleType => {
  const [payload, setPayload] = useState<ISearchMultiPayload>({ query: "" });
  const [data, setData] = useState<IUseTmdbTitleStore>({
    rows: [],
    totalPages: 0,
    totalResults: 0,
    page: 1
  });

  const fetchTmdbTitle = async (): Promise<void> => {
    const { results, totalPages, totalResults, page } =
      await titleRepository.searchMultiFromTMDB(payload);

    const importedTitles = (
      await titleRepository.getsByTmdbIds(results.map(row => row.id))
    ).map(item => item.tmdbId);
    setData({
      page,
      totalPages,
      totalResults,
      rows: results
        .filter(item => item.media_type !== TMDBMediaTypeEnum.PERSON)
        .map(item => {
          const imported = importedTitles.includes(item.id);
          return {
            ...transformResult(item),
            imported
          };
        })
    });
  };

  const setTmdbTitleQuery = (
    updatedPayload: Partial<ISearchMultiPayload>
  ): void => {
    setPayload({ ...payload, ...updatedPayload });
  };

  const reload = (): void => {
    setPayload({ ...payload });
  };

  useEffect(() => {
    fetchTmdbTitle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  return [data, { fetchTmdbTitle, setTmdbTitleQuery, reload }];
};

export default useTmdbTitle;
