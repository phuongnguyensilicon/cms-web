"use client"
import { useEffect } from "react";
import { ToastOptions, toast } from "react-toastify";

/**
 * Return fetcher for use with SWR
 * @param url {string}
 * @returns {{}}
 */
export const fetcher = (url: string) =>
  fetch(url)
    .then(res => res.json())
    .then(json => json);

/**
 * A wrapper for useEffect that allows for async functions
 * @param asyncEffect {function}
 * @param dependencies {any[]}
 */
export const useAsyncEffect = (asyncEffect: Function, dependencies: any[]) => {
  useEffect(() => {
    asyncEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export const toIframeSrc = (id: string, site: string) => {
  switch (site.toLowerCase()) {
    case "youtube":
      return `https://www.youtube.com/embed/${id}`;

    case "vimeo":
      return `https://player.vimeo.com/video/${id}`;

    default:
      return `https://player.zype.com/embed/${id}.html?api_key=ztdKXlvaBV9nkwhspiIp8TZvD2I0xqna84LPi2O_e3r8Wi7kJs7qxR8wz0XugXLP&controls=true`;
  }
};

export const notify = (msg: string, options: ToastOptions = {}) => {
  const defaultOptions: ToastOptions = {
    type: toast.TYPE.SUCCESS,
  };
  toast(msg, { ...defaultOptions, ...options });
};

export const scrollTop = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref?.current) {
    return;
  }
  ref.current.scrollTop = 0;
};

export const formatRuntime = (runtimeInMinutes: number) => {
  if(!runtimeInMinutes) {
    return `0h 0m`;
  }
  const hours = Math.floor(runtimeInMinutes / 60);
  const minutes = runtimeInMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const checkPosterPath = (path: string) => {
  return path ? path : '/images/default-poster.png';
}