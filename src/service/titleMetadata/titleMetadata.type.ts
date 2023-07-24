export interface IAddTitleMetadataPayload {
  metaKey: string;
  metaValue: string;
  titleId: string;
}

export interface ITitleMetadataTransform {
  [key: string]: string;
}
