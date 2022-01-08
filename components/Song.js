import React from "react";
import { millisToMinutesAndSeconds } from "../lib/time";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import useSpotify from "../hooks/useSpotify";
import { findDevice } from "../hooks/findDevice";
import playlistIdState from "../atoms/playlistAtom";

function Song({ order, track }) {
  const spotifyApi = useSpotify();
  const playlistId = useRecoilValue(playlistIdState);
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const date = new Date(track?.added_at);
  let month = date.getUTCMonth() + 1;
  const trackDate =
    date.getUTCDate() + "-" + month + "-" + date.getUTCFullYear();
  console.log(month);
  const playSong = async () => {
    const devices = await findDevice(spotifyApi);

    if (!devices) return alert("Play a song on your device for verification");
    setCurrentTrackId(track.track.id);
    setIsPlaying(true);

    spotifyApi.play({
      context_uri: `spotify:playlist:${playlistId}`,
      offset: {
        uri: track.track.uri,
      },
    });
  };
  return (
    <div
      className="grid grid-cols-2 hover:bg-gray-900 rounded-lg cursor-pointer text-gray-500 py-4 px-5"
      onClick={playSong}
    >
      <div className="flex items-center space-x-4">
        <p>{order + 1}</p>
        <img
          className="h-10 w-10"
          src={
            track.track.album.images[0]?.url ??
            "https://www.wmhbradio.org/wp-content/uploads/2016/07/music-placeholder.png"
          }
          alt=""
        />
        <div>
          <p className="w-36 lg:w64 truncate text-white">{track.track.name}</p>
          <p className="w-40 ">{track.track.artists[0].name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between ml-auto md:ml-0">
        <p className="hidden w-40 md:inline">{track.track.album.name}</p>
        <p className="hidden w-40 md:inline"> {trackDate}</p>
        <p>{millisToMinutesAndSeconds(track.track.duration_ms)}</p>
      </div>
    </div>
  );
}

export default Song;
