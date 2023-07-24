import Ajv from "ajv";
import { ERROR_CODE } from "./constant.util";
const ajv = new Ajv();

class Validator {
  private _getSchemaPath = (schemaPath: string) => schemaPath.split("/");
  protected _buildErrorMessage = (errors: any = []) => {
    if (!errors.length) return ERROR_CODE.INTERNAL_SERVER_ERROR;
    const [{ schemaPath, message, keyword }] = errors;
    if (keyword === "required") return message;
    const splitSchemaPath = this._getSchemaPath(schemaPath);
    return `${splitSchemaPath[splitSchemaPath.length - 2]} ${message}`;
  };

  protected _compile = (schema: any) => {
    return ajv.compile(schema);
  };
}

export default Validator;
