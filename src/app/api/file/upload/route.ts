import { NextApiResponse } from "next";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { fileService } from "@/service";
import { StatusCodeEnum } from "@/utils/enum";

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const formData = await req.formData();
    const file: Blob  = formData.get('file') as Blob;
    if (!file)  {
      return handleResponse(null, StatusCodeEnum.BAD_REQUEST);
    }
    
    const fileUrl = await fileService.uploadFile(file);
    return handleResponse({fileUrl});
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}