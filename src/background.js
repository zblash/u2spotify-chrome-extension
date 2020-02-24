import { YOUTUBE_KEY, SPOTIFY_CLIENT } from "./services/constants/index";
import tokens from "./services/tokens/index";
import { getSongTitle, parseSong } from "./services/youtube-service";
import {
  searchTracks,
  getUsersPlaylists,
  addToPlaylist
} from "./services/spotify-service/index";

/* eslint-disable no-undef */
let port;
let accessToken = tokens.getSpotifyToken();

const toQueryString = obj => {
  const parts = [];
  Object.keys(obj).forEach(key => {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
  });
  return parts.join("&");
};

const launchWebAuthFlow = () => {
  const params = {
    client_id: SPOTIFY_CLIENT,
    redirect_uri: chrome.identity.getRedirectURL("spotifyCB"),
    scope: "user-read-private playlist-modify-public playlist-modify-private",
    response_type: "token"
  };
  const url = `https://accounts.spotify.com/authorize?${toQueryString(params)}`;
  chrome.identity.launchWebAuthFlow(
    {
      url,
      interactive: true
    },
    redirectUrl => {
      const getAccessTokenStartIdx = redirectUrl.indexOf("access_token");
      const getAccessToken = redirectUrl.substring(
        getAccessTokenStartIdx + 13,
        redirectUrl.length
      );
      const getAccessTokenEndIdx = getAccessToken.indexOf("&");
      accessToken = getAccessToken.substr(0, getAccessTokenEndIdx);
      tokens.setSpotifyToken(accessToken);
    }
  );
};

const startAuthFlow = () => {
  if (!accessToken) {
    launchWebAuthFlow();
  }
};

const parseCurrentTab = () =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      const currentTabURL = tabs[0].url;
      if (currentTabURL.indexOf("youtube.com") >= 0) {
        let endIdx = currentTabURL.indexOf("&");
        if (endIdx < 0) {
          endIdx = currentTabURL.length;
        }
        resolve(
          currentTabURL.substring(currentTabURL.indexOf("v=") + 2, endIdx)
        );
      }
      reject(new Error("can't resolved"));
    });
  });

const solveYoutubeVideo = async () => {
  const videoId = await parseCurrentTab();
  const songTitle = await getSongTitle(videoId);
  return parseSong(songTitle);
};

chrome.extension.onConnect.addListener(messagePort => {
  port = messagePort;
  port.onMessage.addListener(async msg => {
    if (msg.type === "GET_PLAYLISTS") {
      const spotifyPlaylists = await getUsersPlaylists(accessToken);
      port.postMessage({
        type: "playlists",
        playlists: spotifyPlaylists
      });
    }
    if (msg.type === "FIND_SONG") {
      const song = await solveYoutubeVideo();
      const songList = await searchTracks(song, accessToken);
      port.postMessage({
        type: "songs",
        songs: songList
      });
    }
    if (msg.startAuthFlow) {
      if (msg.forceAuth) {
        accessToken = null;
      }
      startAuthFlow();
      port.postMessage({
        type: "login",
        youtubeKey: YOUTUBE_KEY,
        spotifyKey: accessToken
      });
    }
    if (msg.type === "ADD_TO_PLAYLIST") {
      await addToPlaylist(msg.playlistId, msg.songUris, accessToken);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const show = tab.url.indexOf("youtube.com/watch") >= 0;
  chrome.browserAction.setBadgeText({ text: show ? "Hey" : "" });
});
