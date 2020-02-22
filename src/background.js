import { YOUTUBE_KEY, SPOTIFY_CLIENT } from "./services/constants/index";
import { tokens } from "./services/tokens/index";

/* eslint-disable no-undef */
let port;
let accessToken = tokens.getSpotifyToken();

const toQueryString = obj => {
  let parts = [];
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
    }
  }
  return parts.join("&");
};

const startAuthFlow = () => {
  if (!accessToken) {
    launchWebAuthFlow();
  }
};

const launchWebAuthFlow = () => {
  const params = {
    client_id: SPOTIFY_CLIENT,
    redirect_uri: chrome.identity.getRedirectURL("spotifyCB"),
    scope: "user-read-private playlist-modify-public playlist-modify-private",
    response_type: "token"
  };
  let url = "https://accounts.spotify.com/authorize?" + toQueryString(params);
  chrome.identity.launchWebAuthFlow(
    {
      url: url,
      interactive: true
    },
    redirectUrl => {
      let getAccessTokenStartIdx = redirectUrl.indexOf("access_token");
      let getAccessToken = redirectUrl.substring(
        getAccessTokenStartIdx + 13,
        redirectUrl.length
      );
      let getAccessTokenEndIdx = getAccessToken.indexOf("&");
      accessToken = getAccessToken.substr(0, getAccessTokenEndIdx);
      tokens.setSpotifyToken(accessToken);
    }
  );
};

const parseCurrentTab = () => {
  let youtubeId;
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let currentTabURL = tabs[0].url;
    if (currentTabURL.indexOf("youtube.com") >= 0) {
      let endIdx = currentTabURL.indexOf("&");
      if (endIdx < 0) {
        endIdx = currentTabURL.length;
      }
      let id = currentTabURL.substring(currentTabURL.indexOf("v=") + 2, endIdx);
      youtubeId = id;
    }
  });
  return id;
};

const getSongTitle = youtubeId => {};

chrome.extension.onConnect.addListener(messagePort => {
  port = messagePort;
  port.onMessage.addListener(msg => {
    if (msg.type === "FIND_SONG") {
      let youtubeId = parseCurrentTab();
      if (youtubeId) {
        let songTitle = getSongTitle(youtubeId);
      }
    }
    if (msg.startAuthFlow) {
      if (msg.forceAuth) {
        accessToken = null;
      }
      startAuthFlow();

      port.postMessage({
        youtubeKey: YOUTUBE_KEY,
        spotifyKey: accessToken
      });
    }
  });
});
