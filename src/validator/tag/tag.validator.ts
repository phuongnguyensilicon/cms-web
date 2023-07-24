import Validator from "@/utils/ajv.util";
import { addTagSchema } from "./tag.schema";

class TagValidator extends Validator {
  constructor() {
    super();
  }

  private _validateAddTagPayload = this._compile(addTagSchema);

  public validateAddTagPayload = <T>(data: T) => {
    const valid = this._validateAddTagPayload(data);
    if (valid) return;
    throw new Error(
      this._buildErrorMessage(this._validateAddTagPayload.errors)
    );
  };
}

const tagValidator = new TagValidator();

export default tagValidator;
