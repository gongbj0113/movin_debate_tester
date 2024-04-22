import logo from './logo.svg';
import './App.css';
import {observer} from "mobx-react-lite";
import {useState} from "react";
import Store from "./store";
import styled from "styled-components";

const StyledControlPannel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  
  & .item {
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const ControlPannel = observer(({store})=> {
  return <StyledControlPannel>
      <div className="item">
          <p>ws path</p>
          <input value={store.wsPath} onChange={(e) => store.setWsPath(e.target.value)}/>
      </div>
      <div className="item">
          <p>userId</p>
          <input value={store.userId} type="number"
                 onChange={(e) => store.setUserId(isNaN(+e.target.value) ? 0 : +e.target.value)}/>
      </div>
      <div className="item">
          <p>UserName</p>
          <input value={store.userName} onChange={(e) => store.setUserName(e.target.value)}/>
      </div>
      <div className="item">
          <p>debateRoomId</p>
          <input value={store.debateRoomId} type="number"
                 onChange={(e) => store.setDebateRoomId(isNaN(+e.target.value) ? 0 : +e.target.value)}/>
      </div>
      <div className="item">
          <p>동의인가?</p>
          <input value={store.isAgree} type="checkbox"
                 onChange={(e) => store.setIsAgree(!!e.target.value)}/>
      </div>
      <button
          onClick={() => {
              store.connect();
          }}
      >
          Connect
      </button>
      {
          store.socket && <button
              onClick={() => {
                  store.exit();
              }}
          >
              종료
          </button>
      }
  </StyledControlPannel>
});


const StyledMessageField = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap:8px;

    & input {
        flex: 1;
        height: 52px;
    }

`;

const MessageField = observer(({store}) => {
    return <StyledMessageField>
    <div>채팅보내기</div>
    <input value={store.message} onChange={(e)=>store.setMessage(e.target.value)}/>
    <button
        onClick={()=>{
          store.sendMessage();
          store.setMessage("");
        }}
        >
        Send
    </button>
  </StyledMessageField>
});

const StyledChatItem = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    
    justify-content: ${props => {
        if(props.type === "agree")
            return "flex-end";
        else if(props.type === "disagree")
            return "flex-start";
        else
            return "center";
    }};
    
    padding: 8px;
`;

const ChatHistory  = observer(({store})=> {
    const list = [...store.messages].reverse();

    return <div>
        {
            list.map((item, index) => {
                return <StyledChatItem key={index} type={
                    (()=>{
                        if(item.type === "TALK")
                            return item.isAgree ? "agree" : "disagree";
                        return "system";
                    })()
                }>
                    {item.type === "TALK" && <div>{item.userId === -1 ? "사회자" : item.userName} : {item.message}</div>}
                    {item.type === "ENTER" && <div>{item.userName}님이 입장하셨습니다.</div>}
                    {item.type === "EXIT" && <div>{item.userName}님이 퇴장하셨습니다.</div>}
                </StyledChatItem>
            })
        }
    </div>
});

const StyledApp = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    
    & .content {
        flex:1;
        flex-shrink: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        justify-content: end;
        
       
  }
`;


function App() {
  const store = useState(() => new Store())[0];


  return (
      <StyledApp>
        <ControlPannel store={store}/>
        <div className="content">
            <ChatHistory store={store}/>
        </div>
        <MessageField store={store}/>
    </StyledApp>
  );
}

export default observer(App);
