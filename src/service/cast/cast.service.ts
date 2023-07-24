import { castRepository } from "@/repository";
import { ERROR_CODE } from "@/utils/constant.util";
import providerService from "../provider/provider.service";
import {
  IGetCastApiResponse,
  IGetCastByTitleIdPayload,
  IGetCastResponse
} from "./cast.type";

class CastService {
  private _transformData = ({
    id,
    crew,
    cast
  }: IGetCastApiResponse): IGetCastResponse => ({
    id,
    cast: cast.map(item => ({
      adult: item.adult,
      gender: item.gender,
      id: item.id,
      knownForDepartment: item.known_for_department,
      name: item.name,
      originalName: item.original_name,
      popularity: item.popularity,
      profilePath: item.profile_path,
      character: item.character,
      creditId: item.credit_id,
      order: item.order
    })),
    crew: crew.map(item => ({
      adult: item.adult,
      gender: item.gender,
      id: item.id,
      knownForDepartment: item.known_for_department,
      name: item.name,
      originalName: item.original_name,
      popularity: item.popularity,
      profilePath: item.profile_path,
      creditId: item.credit_id,
      department: item.department,
      job: item.job
    }))
  });

  public getByTitleId = async ({
    tmdbId,
    providerId
  }: IGetCastByTitleIdPayload): Promise<IGetCastResponse> => {
    try {
      const { name } = await providerService.getById(providerId);
      const casts = await castRepository.getByTitleId({
        tmdbId,
        providerName: name
      });
      return this._transformData(casts);
    } catch (err) {
      console.error(err);
      throw new Error(ERROR_CODE.CAST_NOT_FOUND);
    }
  };
}

const castService = new CastService();

export default castService;
