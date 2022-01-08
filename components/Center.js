import { ChevronDownIcon } from "@heroicons/react/outline";
import { signOut, useSession } from "next-auth/react";
import { Fragment } from "react";
import React, { useEffect, useState } from "react";
import { shuffle } from "lodash";
import { useRecoilState, useRecoilValue } from "recoil";
import playlistIdState, { playlistState } from "../atoms/playlistAtom";
import spotifyApi from "../lib/spotify";
import useSpotify from "../hooks/useSpotify";
import Songs from "./Songs";
import { Menu, Transition } from "@headlessui/react";
const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-red-500",
  "from-yellow-500",
  "from-pink-500",
  "from-purple-500",
];

function Center() {
  const { data: session, status } = useSession();
  const spotifyApi = useSpotify();
  const [color, setColor] = useState(null);
  const playlistId = useRecoilValue(playlistIdState);
  const [playlist, setPlaylist] = useRecoilState(playlistState);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  useEffect(() => {
    setColor(shuffle(colors).pop());
  }, [playlistId]);

  useEffect(() => {
    if (playlistId) {
      spotifyApi
        .getPlaylist(playlistId)
        .then((data) => {
          setPlaylist(data.body);
        })
        .catch((err) => console.log(err));
    }
  }, [spotifyApi, playlistId]);

  return (
    <div className=" flex-grow h-screen overflow-y-scroll scrollbar-hide ">
      <header className="absolute top-5 right-8">
        <Menu>
          <Menu.Button>
            <div className="flex items-center bg-black text-white rounded-full space-x-3 p-1 pr-2 cursor-pointer opacity-90 hover:opacity-80">
              <img
                className="rounded-full w-10 h-10"
                src={session?.user.image}
                alt=""
              />
              <h2>{session?.user.name}</h2>
              <ChevronDownIcon className="h-5 w-5" />
            </div>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right  absolute right-0 mt-2 w-56 rounded-lg shadow-lg cursor-pointer bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? "bg-gray-500 text-white" : "text-white",
                      "block px-4 py-2 text-base"
                    )}
                    onClick={signOut}
                  >
                    Log out
                  </div>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </header>

      <section
        className={` flex items-end space-x-7 bg-gradient-to-b to-black ${color} h-80 text-white p-8`}
      >
        <img
          className="h-44 w-44 shadow-2xl"
          src={playlist?.images?.[0]?.url}
          alt=""
        />
        <div>
          <p>PLAYLIST</p>
          <h1 className="text-2xl md:text-3xl xl:text-5xl font-bold">
            {playlist?.name}
          </h1>
        </div>
      </section>
      <div className="p-8">
        <Songs />
      </div>
    </div>
  );
}

export default Center;
