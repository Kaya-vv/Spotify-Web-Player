import { atom } from "recoil";

export const playlistState = atom({
  key: "playlistState",
  default: null,
});

const playlistIdState = atom({
  key: "playlistIdState",
  default: null,
});

export const contextPlaylist = atom({
  key: "contextPlaylist",
  default: null,
});

export const likedSongs = atom({
  key: "likedSongs",
  default: null
})
export default playlistIdState;
