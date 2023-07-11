interface Options {
  src: string;
  width?: string;
  height?: string;
}

const Video = ({ width, height, src }: Options) => {
  return (
    <iframe
      width={width || '300'}
      height={height || '170'}
      src={src}
      title="Player"
      allowFullScreen
      className="aspect-video rounded bg-black"
    />
  );
};

export default Video;
