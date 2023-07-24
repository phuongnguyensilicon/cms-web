import aws from "aws-sdk";
import { PutObjectRequest } from "aws-sdk/clients/s3";
import { PromiseResult } from "aws-sdk/lib/request";
import fs from "fs";

class FileService {
  public uploadFile = async (file: Blob): Promise<string> => {
    aws.config.update({
      region: process.env.AWS_BUCKET_REGION,
      accessKeyId: process.env.AWS_ACCOUNT_ACCESS_KEY,
      secretAccessKey: process.env.AWS_ACCOUNT_SECRET_KEY,
    });
  
    const s3Bucket: string = process.env.AWS_BUCKET || '';
  
    // Create a new instance of S3
    const s3 = new aws.S3();
   
    const times = new Date().getTime();
    const fileName = `${times}_${file.name}`;
    const fileType = file.type;

    const resBufferArray = await file.arrayBuffer();
    const resBuffer = Buffer.from(resBufferArray);

    const s3Params: PutObjectRequest = {
      Bucket: s3Bucket,
      Key: `${fileName}`,
      ContentType: fileType,
      Body: resBuffer
    };

    const s3Response = await s3.upload(s3Params).promise();
    const result = `${process.env.AWS_S3_CLOUND_FRONT_URL}${fileName}`;
    return result;    
  };
}

const fileService = new FileService();

export default fileService;