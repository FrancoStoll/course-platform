"use client";

import YouTube from "react-youtube";

export default function YoutubeVideo({
  videoId,
  onFinishedVideo,
}: {
  videoId: string;
  onFinishedVideo?: () => void;
}) {
  return (
    <YouTube
      videoId={videoId}
      onEnd={onFinishedVideo}
      className="w-full h-full"
      opts={{ width: "100%", height: "100%" }}
    />
  );
}
