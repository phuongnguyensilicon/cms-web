export const addUpdateUserSchema = {
  $id: "/schemas/addUpdateUserSchema",
  type: "object",
  additionalProperties: false,
  required: ["userName"],
  properties: {
    userName: {
      type: "string"
    }
  }
};