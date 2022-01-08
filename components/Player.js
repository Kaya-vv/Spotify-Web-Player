import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify";
import useSongInfo from "../hooks/useSongInfo";
import {
  HeartIcon,
  VolumeUpIcon as VolumeDownIcon,
  VolumeOffIcon,
} from "@heroicons/react/outline";
import {
  RewindIcon,
  RefreshIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";
import { debounce } from "lodash";
import { findDevice } from "../hooks/findDevice";
import playlistIdState, { contextPlaylist } from "../atoms/playlistAtom";
import { millisToMinutesAndSeconds } from "../lib/time";
import { getServerSideProps } from "../pages";
function Player() {
  const spotifyApi = useSpotify();
  const songInfo = useSongInfo();
  const [currentTrack, setCurrentTrack] = useRecoilState(currentTrackIdState);
  const playlistId = useRecoilValue(playlistIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [context, setContext] = useRecoilState(contextPlaylist);
  const [volume, setVolume] = useState(100);
  const [progress, setIsProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off");
  useEffect(() => {
    const interval = setInterval(() => {
      spotifyApi.getMyCurrentPlaybackState().then((data) => {
        setIsProgress(data?.body?.progress_ms);

        if (data.body?.is_playing) {
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
        if (data?.body?.item?.id != currentTrack) {
          const url = data.body?.context?.href;
          const contextUri = url?.substring(url.lastIndexOf("/") + 1);
          setContext(contextUri);
          setCurrentTrack(data?.body?.item?.id);
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [currentTrack]);
  useEffect(() => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      setShuffle(data.body?.shuffle_state);
      setRepeat(data.body?.repeat_state);
    });
  }, []);
  useEffect(async () => {
    spotifyApi.getMySavedTracks({}).then(
      function (data) {
        console.log(data);
        console.log("Done!");
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );

    const devices = await findDevice(spotifyApi);
    if (!devices)
      return console.log("Play a song on your device for verification");
    if (volume >= 0 && volume <= 100) {
      debouncedVolume(volume);
    }
  }, [volume]);

  const debouncedVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume);
    }, 300),
    []
  );

  const calcWidth = () => {
    const width = Math.round((progress / songInfo?.duration_ms) * 100);
    return width;
  };
  const handleShuffle = async () => {
    const devices = await findDevice(spotifyApi);
    if (!devices) return alert("Play a song on your device for verification");

    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (!data.body?.shuffle_state) {
        spotifyApi.setShuffle(true);
        setShuffle(true);
      } else {
        spotifyApi.setShuffle(false);
        setShuffle(false);
      }
    });
  };

  const handleRepeat = async () => {
    const devices = await findDevice(spotifyApi);
    if (!devices) return alert("Play a song on your device for verification");

    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body?.repeat_state == "off") {
        spotifyApi.setRepeat("track");
        setRepeat("track");
      } else {
        spotifyApi.setRepeat("off");
        setRepeat("off");
      }
    });
  };
  const handlePlayPause = async () => {
    const devices = await findDevice(spotifyApi);
    if (!devices) return alert("Play a song on your device for verification");

    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (!data.body.item) return alert("Song not found");
      if (data.body?.is_playing) {
        setCurrentTrack(data.body?.item?.id);
        spotifyApi.pause({
          context_uri: `spotify:playlist:${playlistId}`,
          offset: {
            uri: `spotify:track:${currentTrack}`,
          },
        });
        setIsPlaying(false);
      } else {
        spotifyApi.play();

        setIsPlaying(true);
      }
    });
  };

  const handleForward = () => {
    spotifyApi
      .skipToNext()
      .then((data) => {
        setTimeout(() => {
          spotifyApi.getMyCurrentPlaybackState().then((result) => {
            setCurrentTrack(result.body?.item?.id);
          });
        }, 300);
      })
      .catch((err) => alert("Play a song on your device for verification"));
    setIsPlaying(true);
  };

  const handleRewind = () => {
    spotifyApi
      .skipToPrevious()
      .then((data) => {
        setTimeout(() => {
          spotifyApi.getMyCurrentPlaybackState().then((result) => {
            setCurrentTrack(result.body?.item?.id);
          });
        }, 300);
      })
      .catch((err) => alert("Play a song on your device for verification"));
    setIsPlaying(true);
  };

  return (
    <div className="h-[6.1rem] bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md: px-8">
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline h-10 w-10"
          src={
            songInfo
              ? songInfo?.album.images?.[0]?.url
              : "https://www.wmhbradio.org/wp-content/uploads/2016/07/music-placeholder.png"
          }
          alt=""
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>

      <div className="flex-col self-center space-y-4 ">
        <div className="flex items-center justify-evenly">
          <SwitchHorizontalIcon
            onClick={handleShuffle}
            className={shuffle ? "text-green-500 button" : "button"}
          />
          <RewindIcon onClick={handleRewind} className="button " />
          {isPlaying ? (
            <PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />
          ) : (
            <PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />
          )}
          <FastForwardIcon onClick={handleForward} className="button" />
          <RefreshIcon
            onClick={handleRepeat}
            className={repeat == "track" ? "text-green-500 button" : "button"}
          />
        </div>

        <div className="flex items-center justify-center space-x-4">
          <p>{progress ? millisToMinutesAndSeconds(progress) : "0:00"}</p>
          <div className="w-full bg-gray-200 h-1 ">
            <div
              className="bg-green-500 h-1"
              style={{ width: calcWidth() + "%" }}
            ></div>
          </div>
          <p>
            {songInfo
              ? millisToMinutesAndSeconds(songInfo?.duration_ms)
              : "0:00"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        {volume == 0 ? (
          <VolumeOffIcon onClick={() => setVolume(100)} className="button" />
        ) : (
          <VolumeDownIcon onClick={() => setVolume(0)} className="button" />
        )}

        <input
          className="w-14 md:w-28"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          type="range"
          min={0}
          max={100}
        />
      </div>
    </div>
  );
}

export default Player;
