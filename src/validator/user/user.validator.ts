import Validator from "@/utils/ajv.util";
import { addUpdateUserSchema } from "./user.schema";

class UpdateUserValidator extends Validator {
  constructor() {
    super();
  }

  private _validateAddUpdateUserPayload = this._compile(addUpdateUserSchema);

  public validateUpdateUserPayload = <T>(data: T) => {
    const valid = this._validateAddUpdateUserPayload(data);
    if (valid) return;
    throw new Error(
      this._buildErrorMessage(this._validateAddUpdateUserPayload.errors)
    );
  };
}

const updateUserValidator = new UpdateUserValidator();

export default updateUserValidator;
