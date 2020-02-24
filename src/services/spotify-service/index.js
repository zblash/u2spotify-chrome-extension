import axios from "axios";

const apiUrl = "https://api.spotify.com/v1";

export const searchTracks = async (songTitle, token) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  const url = `${apiUrl}/search?q=${songTitle}&type=track`;
  return axios.get(url, { headers }).then(response =>
    response.data.tracks.items.map(item => ({
      id: item.id,
      name: `${item.artists[0].name} - ${item.name}`,
      uri: item.uri
    }))
  );
};

export const getUserInfos = async token => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  const url = `${apiUrl}/me`;
  return axios.get(url, { headers }).then(response => response.data);
};

export const getUsersPlaylists = async token => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  const userInfo = await getUserInfos(token);
  const url = `${apiUrl}/me/playlists`;
  return axios
    .get(url, { headers })
    .then(response =>
      response.data.items
        .filter(item => item.owner.id === userInfo.id)
        .map(item => ({ id: item.id, name: item.name }))
    );
};

export const addToPlaylist = async (playlistId, uris, token) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  const url = `${apiUrl}/playlists/${playlistId}/tracks`;
  await axios
    .post(url, { uris }, { headers })
    .catch(error => console.log(error));
};
