import { Provider, Prisma } from "@prisma/client";
import prisma from "@/utils/prisma.util";
import { ERROR_CODE } from "@/utils/constant.util";

class ProviderService {
  private _defaultCondition: Prisma.ProviderWhereInput = { active: true };
  public getById = async (providerId: string): Promise<Provider> => {
    try {
      const provider = await prisma.provider.findFirst({
        where: { ...this._defaultCondition, id: providerId }
      });
      if (!provider) {
        throw new Error(ERROR_CODE.PROVIDER_NOT_FOUND);
      }
      return provider;
    } catch (err: unknown) {
      console.error(err);
      throw new Error(ERROR_CODE.PROVIDER_NOT_FOUND);
    }
  };
  public getByName = async (name: string): Promise<Provider> => {
    try {
      const provider = await prisma.provider.findFirst({
        where: { ...this._defaultCondition, name }
      });
      if (!provider) {
        throw new Error(ERROR_CODE.PROVIDER_NOT_FOUND);
      }
      return provider;
    } catch (err: unknown) {
      console.error(err);
      throw new Error(ERROR_CODE.PROVIDER_NOT_FOUND);
    }
  };
}

const providerService = new ProviderService();

export default providerService;
