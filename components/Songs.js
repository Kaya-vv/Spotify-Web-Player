import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistState, likedSongs } from "../atoms/playlistAtom";
import Song from "./Song";
import {
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";

function Songs() {
  const playlist = useRecoilValue(playlistState);
  const [sortDate, setSortDate] = useState(false);
  const [liked, setLiked] = useRecoilState(likedSongs);

  const toShow = liked ? playlist?.items : playlist?.tracks?.items;
  console.log(toShow);
  const sortedData = [].concat(toShow).sort((a, b) => {
    if (a.added_at > b.added_at) {
      return -1;
    }
    if (a.added_at < b.added_at) {
      return 1;
    }
  });
  const handleSort = () => {
    if (sortDate) {
      setSortDate(false);
    } else {
      setSortDate(true);
    }
  };
  
  return (
    <div>
      <div className="px-8 flex flex-col space-y-1">
        <div className="grid grid-cols-2  rounded-lg cursor-pointer text-gray-500 py-4 px-5">
          <div className="flex items-center  space-x-4">
            <p className="hover:text-white">#</p>
            <p className="hover:text-white">TITLE</p>
          </div>
          <div className="flex items-center justify-between ml-auto md:ml-0">
            <p className="hidden w-40 md:inline hover:text-white">ALBUM</p>
            <div className="flex w-40 space-x-2 mr-2 items-center hover:text-white">
              <p onClick={handleSort} className="hidden md:inline ">
                ADDED DATE
              </p>
              <p>
                {sortDate ? (
                  <ChevronUpIcon className=" hidden md:inline w-4 h-4" />
                ) : (
                  <ChevronDownIcon className=" hidden md:inline w-4 h-4" />
                )}
              </p>
            </div>

            <p>
              <ClockIcon className="button hover:text-white" />
            </p>
          </div>
        </div>
      </div>
      <hr className="border-t-[0.1px] ml-4 border-gray-900"></hr>
      <div className="px-8 flex flex-col space-y-1 pb-28 text-white">
        {sortDate
          ? sortedData.map((track, i) => (
              <Song key={i} track={track} order={i} />
            ))
          : toShow?.map((track, i) => (
              <Song key={i} track={track} order={i} />
            ))}
      </div>
    </div>
  );
}

export default Songs;
