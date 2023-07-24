import Validator from "@/utils/ajv.util";
import { updateTitlePayloadSchema } from "./title.schema";

class TitleValidator extends Validator {
  constructor() {
    super();
  }

  private _validateUpdateTitlePayload = this._compile(updateTitlePayloadSchema);

  public validateUpdateTitlePayload = <T>(data: T) => {
    const valid = this._validateUpdateTitlePayload(data);
    if (valid) return;
    throw new Error(
      this._buildErrorMessage(this._validateUpdateTitlePayload.errors)
    );
  };
}

const titleValidator = new TitleValidator();

export default titleValidator;
