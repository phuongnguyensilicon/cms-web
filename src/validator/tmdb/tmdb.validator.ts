import Validator from "@/utils/ajv.util";
import { importTitlePayloadSchema } from "./tmdb.schema";

class TmdbValidator extends Validator {
  constructor() {
    super();
  }

  private _validateImportTitlePayload = this._compile(importTitlePayloadSchema);

  public validateImportTitlePayload = <T>(data: T) => {
    const valid = this._validateImportTitlePayload(data);
    if (valid) return;
    throw new Error(
      this._buildErrorMessage(this._validateImportTitlePayload.errors)
    );
  };
}

const tmdbValidator = new TmdbValidator();

export default tmdbValidator;
