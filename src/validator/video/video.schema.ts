export const addVideoPayloadSchema = {
  $id: "/schemas/addVideoPayloadSchema",
  type: "object",
  additionalProperties: false,
  required: ["name", "value"],
  properties: {
    name: {
      type: "string"
    },
    value: {
      type: "string"
    }
  }
};

export const addMultiVideosPayloadSchema = {
  $id: "/schemas/addMultiVideosPayloadSchema",
  type: "array",
  items: addVideoPayloadSchema
};

export const updateVideoPayloadSchema = {
  $id: "/schemas/updateVideoPayloadSchema",
  type: "object",
  additionalProperties: false,
  properties: {
    name: {
      type: "string"
    },
    value: {
      type: "string"
    }
  }
};
