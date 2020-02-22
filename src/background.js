import { YOUTUBE_KEY, SPOTIFY_CLIENT } from "./services/constants/index";
import { tokens } from "./services/tokens/index";

/* eslint-disable no-undef */
let port;
let accessToken = tokens.getSpotifyToken;
const youtubeKey = YOUTUBE_KEY;

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
      let getAccessTokenStartIdx = redirect_url.indexOf("access_token");
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

chrome.extension.onConnect.addListener(messagePort => {
  port = messagePort;
  port.onMessage.addListener(msg => {
    if (msg.startAuthFlow) {
      if (msg.forceAuth) {
        accessToken = null;
      }
      startAuthFlow();
      port.postMessage({
        youtubeKey: youtubeKey,
        spotifyKey: accessToken
      });
    }
  });
});
