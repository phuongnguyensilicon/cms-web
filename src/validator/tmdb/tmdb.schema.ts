import { TMDBMediaTypeEnum } from "@/utils/enum";

export const importTitlePayloadSchema = {
  $id: "/schemas/importTitlePayloadSchema",
  type: "object",
  additionalProperties: false,
  required: ["name", "tmdbId", "mediaType"],
  properties: {
    name: {
      type: "string"
    },
    tmdbId: {
      type: "number"
    },
    posterPath: {
      type: "string"
    },
    backdropPath: {
      type: "string"
    },
    mediaType: {
      enum: Object.values(TMDBMediaTypeEnum)
    },
    metadata: {
      type: "object"
    },
    tags: {
      type: "array",
      items: {
        type: "string"
      }
    }
  }
};
