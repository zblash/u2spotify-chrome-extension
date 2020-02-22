import React, { useState } from "react";
import styled from "styled-components";

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
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 7px;
`;
const StyledVideoWrapper = styled.div`
  width: 100%;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: start;
`;
const StyledVideoDesc = styled.p`
  margin: 6px 0 6px 6px;
`;
const StyledVideoCheckBox = styled.input`
  margin: 6px 0 6px 6px;
  width: 18px;
  height: 18px;
`;

const IndexPage = () => {
  const [count, setCount] = useState(0);
  const [token, setToken] = useState();
  const onBackgroundMessage = message => {
    console.log(message);
    setToken(message.accessToken);
  };
  const gotTabs = tabs => {
    console.log(tabs);
  };
  /*
  React.useEffect(() => {
    const port = window.chrome.extension.connect({ name: "U2Spotify" });
    port.postMessage({ startAuthFlow: true, forceAuth: true });
    port.onMessage.addListener(onBackgroundMessage);
    const params = {
      active: true,
      currentWindow: true
    };
    chrome.tabs.query(params, gotTabs);
  }, []);
*/
  return (
    <StyledWrapper>
      <StyledLoginBtn>Login to Spotify</StyledLoginBtn>
      <StyledVideoListWrapper>
        <StyledVideoWrapper>
          <StyledVideoCheckBox type="checkbox" />
          <StyledVideoDesc>
            Baris Akarsu - Bir Sevmek Bin Defa Olmek Demekmis
          </StyledVideoDesc>
        </StyledVideoWrapper>
        <StyledVideoWrapper>
          <StyledVideoCheckBox type="checkbox" />
          <StyledVideoDesc>
            Baris Akarsu - Bir Sevmek Bin Defa Olmek Demekmis
          </StyledVideoDesc>
        </StyledVideoWrapper>
        <StyledVideoWrapper>
          <StyledVideoCheckBox type="checkbox" />
          <StyledVideoDesc>
            Baris Akarsu - Bir Sevmek Bin Defa Olmek Demekmis
          </StyledVideoDesc>
        </StyledVideoWrapper>
      </StyledVideoListWrapper>
    </StyledWrapper>
  );
};
const PIndexPage = React.memo(IndexPage);

export { PIndexPage as IndexPage };
