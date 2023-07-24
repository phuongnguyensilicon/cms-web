import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { PutObjectRequest } from "aws-sdk/clients/s3";
import { NextApiResponse } from "next";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { accountService } from "@services/index";

const s3 = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCOUNT_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCOUNT_SECRET_KEY
});

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
    if (token) {
      const formData = await req.formData();
      const file: Blob = formData.get("file") as Blob;

      if (!file) {
        return handleResponse(null, StatusCodeEnum.BAD_REQUEST);
      } else {
        const fileExtension = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const folderName = "avatars";
        const fileArrayBuffer = await file.arrayBuffer();

        const params: PutObjectRequest = {
          Bucket: process.env.AWS_BUCKET || "",
          Key: `${folderName}/${fileName}`,
          Body: Buffer.from(fileArrayBuffer),
          ContentType: file.type
        };

        await s3.upload(params).promise();
        const fileUrl = `${process.env.AWS_S3_CLOUND_FRONT_URL}${folderName}/${fileName}`;
        await accountService.updateUser({ avatar: fileUrl }, token);

        return handleResponse({ fileUrl });
      }
    } else {
      return throwResponseError(
        ERROR_MESSAGE.INVALID_AUTHENTICATION,
        StatusCodeEnum.UNAUTHORIZED
      );
    }
  } catch (error) {
    console.error(error);
    return throwResponseError((error as Error).message);
  }
}
