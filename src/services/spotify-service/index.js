import axios from "axios";

const apiUrl = "https://api.spotify.com/v1";
let userInfo = {};

export const searchTracks = async (songTitle, token) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  const url = `${apiUrl}/search?q=${songTitle}&type=track`;
  return axios.get(url, { headers }).then(response =>
    response.data.tracks.items.map(item => {
      return { id: item.id, name: `${item.artists[0].name} - ${item.name}` };
    })
  );
};

export const getUserInfos = async token => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  const url = `${apiUrl}/me`;
  axios.get(url, { headers }).then(response => (userInfo = response.data));
};

export const getUsersPlaylists = async token => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  await getUserInfos(token);
  const url = `${apiUrl}/me/playlists`;
  return axios.get(url, { headers }).then(response =>
    response.data.items
      .filter(item => item.owner.id === userInfo.id)
      .map(item => {
        return { id: item.id, name: item.name };
      })
  );
};
