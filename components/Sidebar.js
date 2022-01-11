import React, { useEffect, useState } from "react";
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  PlusCircleIcon,
  HeartIcon,
  RssIcon,
  VolumeUpIcon,
  LogoutIcon,
} from "@heroicons/react/outline";
import { signOut, useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import { useRecoilState, useRecoilValue } from "recoil";
import playlistIdState, { contextPlaylist, playlistState, likedSongs } from "../atoms/playlistAtom";
import { findDevice } from "../hooks/findDevice";

function Sidebar() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [context, setContext] = useRecoilState(contextPlaylist);
  const [playlists, setPlaylists] = useState([]);
  const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
  const [liked, setLiked] = useRecoilState(likedSongs);
    const [playlist, setPlaylist] = useRecoilState(playlistState);

  useEffect(() => {
    if (spotifyApi.getAccessToken()) {
      spotifyApi.getUserPlaylists({ limit: 30 }).then((data) => {
        setPlaylists(data.body.items);
        setPlaylistId(data.body.items[0].id);
      });
    }
  }, [session, spotifyApi]);

  const playPlaylist = async (id) => {
    const devices = await findDevice(spotifyApi);
    if (!devices) return alert("Play a song on your device for verification");

    spotifyApi.play({
      context_uri: `spotify:playlist:${id}`,
    });
    setContext(id);
  };

  const handleLiked = () => {
      
        spotifyApi.getMySavedTracks({}).then(
      function (data) {
       
      setPlaylist(data.body);   
      setLiked(true);   
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
    
  }
  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  return (
    <div className="text-gray-500 p-5 text-xs pb-36 lg:text-sm sm:max-w-[12rem] lg:max-w-[15rem] hidden md:inline-flex overflow-y-scroll scrollbar-hide h-screen  border-r border-gray-900 ">
      <div className="space-y-4 space-y">
        <button className="flex items-center space-x-2 hover:text-white">
          <HomeIcon className="h-5 w-5" />
          <p>Home</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <SearchIcon className="h-5 w-5" />
          <p>Search</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <LibraryIcon className="h-5 w-5" />
          <p>Your Library</p>
        </button>

        <hr className="border-t-[0.1px] border-gray-900" />

        <button className="flex items-center space-x-2 hover:text-white">
          <PlusCircleIcon className="h-5 w-5" />
          <p>Create Playlist</p>
        </button>
        <button  onClick={handleLiked} className="flex items-center space-x-2 hover:text-white">
          <HeartIcon className="h-5 w-5" />
          <p>Liked songs</p>
        </button>
   

        <hr className="border-t-[0.1px] border-gray-900" />
        {playlists.map((playlist, key) => (
          <div key={key + "div"} className="flex justify-between">
            <p
              key={playlist.id}
              onClick={() => setPlaylistId(playlist.id)}
              onDoubleClick={() => playPlaylist(playlist.id)}
              className="cursor-pointer hover:text-white"
            >
              {truncate(playlist.name, 30)}
            </p>
            {playlist.id == context && (
              <p key={playlist.id + "playlist"}>
                <VolumeUpIcon key={key} className="w-5 h-5" />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
