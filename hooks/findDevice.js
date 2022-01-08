import useSpotify from "./useSpotify";

export const findDevice = async (spotifyApi) => {
  const devices = await spotifyApi.getMyDevices().then((data) => {
    return data.body.devices;
  });
  if (!devices[0]?.is_active || !devices[0]) return false;

  return devices;
};
