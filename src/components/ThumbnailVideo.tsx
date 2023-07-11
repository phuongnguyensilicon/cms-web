import PlayButton from '@images/PlayButton.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Coin from './Coin';
import VideoPopupPlayer from './VideoPlayerPopup';
type Props = {
  video: any;
  hideCoin: boolean;
  completed: boolean;
  miniPlay?: boolean;
  onclick: () => void;
};
export default function ThumbnailVideo({
  video,
  hideCoin,
  completed,
  miniPlay,
  onclick
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showVideoPlayer = () => {
    setIsOpen(true);
  };

  const onWatchVideo = () => {
    if (hideCoin) {
      showVideoPlayer();
    } else {
      onclick();
    }
  };

  useEffect(() => {
    if (completed) {
      showVideoPlayer();
    }
  }, [completed]);

  return (
    <>
      <div className="video-thumbnail relative">
        {miniPlay ? (
          <svg
            width="10"
            height="13"
            viewBox="0 0 10 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="center-item h-[20px] w-[26px]"
            onClick={() => onWatchVideo()}
          >
            <path
              d="M8.9048 7.40812L5.16002 10.2163L1.92464 12.6273C1.74563 12.7643 1.55289 12.8191 1.36014 12.8191C0.864511 12.8191 0.410156 12.4355 0.410156 11.8738V1.43546C0.410156 0.873796 0.878229 0.490234 1.36014 0.490234C1.55288 0.490234 1.74564 0.544987 1.92464 0.68201L5.16002 3.09295L8.9048 5.88747C9.41428 6.27113 9.41428 7.03824 8.9048 7.40812Z"
              fill="#C0C0C0"
              fillOpacity="0.6"
            />
          </svg>
        ) : (
          <Image
            src={PlayButton}
            alt="poster"
            width={43}
            height={43}
            className="center-item w-auto h-auto"
            onClick={() => onWatchVideo()}
          />
        )}

        <Image
          id="locked-carousel-poster"
          src={video?.thumbnailUrl}
          alt="poster"
          width={316}
          height={450}
          className="aspect-video w-full"
        />

        <div
          id={`coin_video_${video?.key}`}
          className="flex absolute right-0 bottom-0"
        >
          <Coin
            value={25}
            size={{ w: 25, h: 25 }}
            disabled={hideCoin}
            className="text-[9px] z-[1]"
          ></Coin>
        </div>
      </div>
      {video && (
        <VideoPopupPlayer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          options={video}
        ></VideoPopupPlayer>
      )}
    </>
  );
}
