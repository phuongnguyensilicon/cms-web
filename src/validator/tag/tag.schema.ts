export const addTagSchema = {
  $id: "/schemas/addTagSchema",
  type: "object",
  additionalProperties: false,
  required: ["name"],
  properties: {
    name: {
      type: "string"
    }
  }
};
