"use client";
import { ChangeEvent } from "react";
import Image from "next/image";
import { formatDate } from "@/utils/common.util";
import {
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_URL,
  DEFAULT_IMAGE_WIDTH
} from "@/utils/constant.util";
import { ITitleCardProps } from "./type";

const TitleCard = ({
  id,
  image,
  title,
  releaseDate,
  overview,
  checked = false,
  onChecked,
  imported
}: ITitleCardProps) => {
  const imgSrc =
    image !== "" ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${image}` : "";

  const onCheck = (_event: ChangeEvent<HTMLInputElement>) => {
    onChecked?.(id);
  };

  return (
    <div className="flex flex-row">
      <div className="flex flex-col md:flex-row overflow-hidden bg-white rounded-lg shadow-xl hover:shadow-lg  mt-4 w-11/12 mx-2">
        <div className="h-48 min-[320px]:w-auto min-[320px]:mx-auto">
          {imgSrc ? (
            <Image
              className="inset-0 h-full w-48 object-center object-cover"
              src={imgSrc}
              alt={image}
              width={DEFAULT_IMAGE_WIDTH}
              height={DEFAULT_IMAGE_HEIGHT}
            />
          ) : (
            <img
              className="inset-0 h-full w-48 object-center object-cover"
              src={DEFAULT_IMAGE_URL}
              alt={title}
            />
          )}
        </div>
        <div className="w-full py-4 px-6 text-gray-800 flex flex-col justify-between">
          <div className="w-full flex flex-col justify-between">
            <h3 className="font-semibold text-lg leading-tight truncate">
              {title}
            </h3>
            <h4 className="leading-tight truncate">
              {formatDate(releaseDate)}
            </h4>
          </div>
          <p className="text-sm text-gray-700 tracking-wide mt-2">{overview}</p>
        </div>
      </div>
      <div className="flex flex-row items-center">
        {!imported && (
          <input
            name="comments"
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
        )}
      </div>
    </div>
  );
};

export default TitleCard;
