import Validator from "@/utils/ajv.util";
import {
  addMultiVideosPayloadSchema,
  updateVideoPayloadSchema
} from "./video.schema";

class VideoValidator extends Validator {
  constructor() {
    super();
  }

  private _validateAddMultiVideosPayload = this._compile(
    addMultiVideosPayloadSchema
  );

  private _validateUpdateVideoPayload = this._compile(updateVideoPayloadSchema);

  public validateAddMultiVideosPayload = <T>(data: T) => {
    const valid = this._validateAddMultiVideosPayload(data);
    if (valid) return;
    throw new Error(
      this._buildErrorMessage(this._validateAddMultiVideosPayload.errors)
    );
  };

  public validateUpdateVideoPayload = <T>(data: T) => {
    const valid = this._validateUpdateVideoPayload(data);
    if (valid) return;
    throw new Error(
      this._buildErrorMessage(this._validateUpdateVideoPayload.errors)
    );
  };
}

const videoValidator = new VideoValidator();

export default videoValidator;
