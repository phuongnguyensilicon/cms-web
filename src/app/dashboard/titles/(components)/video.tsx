const srcStatic = "https://www.youtube.com/embed/d15DP5zqnYE";

interface Options {
  src: string;
  width?: string;
  height?: string;
}

const Video = ({ width, height, src }: Options) => {
  return (
    <iframe
      width={width || "300"}
      height={height || "170"}
      src={src}
      title="Player"
      allowFullScreen
    />
  );
};

export default Video;

{
  /* <iframe src="https://player.zype.com/embed/642d946ba47941000187fb18.html?api_key=ztdKXlvaBV9nkwhspiIp8TZvD2I0xqna84LPi2O_e3r8Wi7kJs7qxR8wz0XugXLP&autoplay=true&controls=true" width="560" height="315" frameborder="0" allowfullscreen="allowfullscreen"></iframe> */
}
