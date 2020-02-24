import React, { useState } from "react";
import styled from "styled-components";
import { tokens } from "../../services/tokens/index";

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;
const StyledLoginBtn = styled.button`
  background-color: #1ed760;
  border: none;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  border-radius: 500px;
  padding: 11px 32px 9px;
  cursor: pointer;
  width: 50%;
  margin: 0 auto 20px auto;
`;
const StyledVideoListWrapper = styled.div`
  width: 90%;
  margin: auto;
  min-height: 70px;
  border: 1px solid #ddd;
  border-radius: 7px;
`;
const StyledVideoWrapper = styled.div`
  width: 100%;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: start;
  :last-child {
    border: none;
  }
`;
const StyledVideoDesc = styled.p`
  margin: 6px 0 6px 6px;
`;
const StyledVideoCheckBox = styled.input`
  margin: 6px 0 6px 6px;
  width: 18px;
  height: 18px;
`;
const StyledPlayListWrapper = styled.div`
  margin: 10px auto 0 auto;
  width: 90%;
  height: 30px;
  display: flex;
  justify-content: space-between;
`;
const StyledPlayListSelect = styled.select`
  border: 2px solid #ddd;
  background-color: #fff;
  border-radius: 100px;
  width: 50%;
  height: 30px;
`;
const StyledAddBtn = styled.button`
  background-color: #1ed760;
  border: none;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  border-radius: 500px;
  cursor: pointer;
  width: 40%;
  height: 30px;
`;

const IndexPage = () => {
  const [port, setPort] = useState();
  const [spotifyToken, setSpotifyToken] = useState(tokens.getSpotifyToken());
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);

  const onBackgroundMessage = React.useCallback(
    message => {
      if (message.type === "login") {
        setSpotifyToken(message.spotifyKey);
      }
      if (message.type === "playlists") {
        setPlaylists(message.playlists);
      }
      if (message.type === "songs") {
        setSongs(message.songs);
      }
    },
    [spotifyToken, setSpotifyToken, playlists]
  );

  const handleFindSong = React.useCallback(() => {
    port.postMessage({ type: "FIND_SONG" });
  }, [port]);

  const handleLogin = React.useCallback(() => {
    port.postMessage({ startAuthFlow: true, forceAuth: false });
  }, [port]);

  React.useEffect(() => {
    setPort(window.chrome.extension.connect({ name: "U2Spotify" }));
  }, []);

  React.useEffect(() => {
    if (port) {
      port.onMessage.addListener(onBackgroundMessage);
    }
  }, [port]);

  React.useEffect(() => {
    if (spotifyToken && port) {
      port.postMessage({ type: "GET_PLAYLISTS" });
    }
  }, [spotifyToken, port]);
  return (
    <StyledWrapper>
      {!spotifyToken && (
        <StyledLoginBtn onClick={handleLogin}>Login to Spotify</StyledLoginBtn>
      )}
      {spotifyToken && (
        <>
          <StyledLoginBtn onClick={handleFindSong}>
            Find in Spotify
          </StyledLoginBtn>
          <StyledVideoListWrapper>
            {songs &&
              songs.map(song => (
                <StyledVideoWrapper>
                  <StyledVideoCheckBox id={song.id} type="checkbox" />
                  <StyledVideoDesc>{song.name}</StyledVideoDesc>
                </StyledVideoWrapper>
              ))}
          </StyledVideoListWrapper>
          <StyledPlayListWrapper>
            <StyledPlayListSelect>
              {playlists &&
                playlists.map(item => (
                  <option value={item.id}>{item.name}</option>
                ))}
            </StyledPlayListSelect>
            <StyledAddBtn>Add to Playlist</StyledAddBtn>
          </StyledPlayListWrapper>
        </>
      )}
    </StyledWrapper>
  );
};
const PIndexPage = React.memo(IndexPage);

export { PIndexPage as IndexPage };
