import { YOUTUBE_KEY, SPOTIFY_CLIENT } from "./services/constants/index";
import { tokens } from "./services/tokens/index";
import axios from "axios";

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
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      let currentTabURL = tabs[0].url;
      if (currentTabURL.indexOf("youtube.com") >= 0) {
        let endIdx = currentTabURL.indexOf("&");
        if (endIdx < 0) {
          endIdx = currentTabURL.length;
        }
        resolve(
          currentTabURL.substring(currentTabURL.indexOf("v=") + 2, endIdx)
        );
      }
      reject("can't resolved");
    });
  });
};

const getSongTitle = async youtubeId => {
  const headers = {
    "Content-Type": "application/json"
  };
  const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeId}&fields=items%28snippet%28title,description%29%29&key=${YOUTUBE_KEY}`;
  return await axios.get(youtubeApiUrl, { headers }).then(d => {
    if (d.data.items && d.data.items.length > 0) {
      console.log(d.data.items[0].snippet.description);
      return d.data.items[0].snippet.title;
    }
  });
};

const solveYoutubeVideo = async () => {
  const videoId = await parseCurrentTab();
  const songTitle = await getSongTitle(videoId);
};

chrome.extension.onConnect.addListener(messagePort => {
  port = messagePort;
  port.onMessage.addListener(async msg => {
    if (msg.type === "FIND_SONG") {
      await solveYoutubeVideo();
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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  const show = tab.url.indexOf("youtube.com/watch") >= 0;
  chrome.browserAction.setBadgeText({ text: show ? "Hey" : "" });
});
