export const updateTitlePayloadSchema = {
  $id: "/schemas/updateTitlePayloadSchema",
  type: "object",
  additionalProperties: false,
  properties: {
    synopsis: {
      type: "string"
    },
    posterPath: {
      type: "string"
    },
    tags: {
      type: "array",
      items: {
        type: "string"
      }
    }
  }
};
