import axios from "axios";
import { YOUTUBE_KEY } from "../constants/index";

export const getSongTitle = async youtubeId => {
  const headers = {
    "Content-Type": "application/json"
  };
  const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeId}&fields=items%28snippet%28title%29%29&key=${YOUTUBE_KEY}`;
  return await axios.get(youtubeApiUrl, { headers }).then(response => {
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].snippet.title;
    }
  });
};

export const parseSong = songTitle => {
  return songTitle.replace(/\&|feat\.|remix|\(.*?\)|#|&|amp;/gim, "");
};
