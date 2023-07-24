import { questionaireService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";

export async function GET(req: Request, res: NextApiResponse) {
  let results = await questionaireService.getAllQuestionaires();
  return handleResponse(results, StatusCodeEnum.OK);
}
