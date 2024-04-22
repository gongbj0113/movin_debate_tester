import {observer} from "mobx-react-lite";
import {useEffect, useRef, useState} from "react";
import Store from "./store";
import styled from "styled-components";
import appStore from "./app_store";

const StyledControlPannel = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    box-sizing: border-box;

    & .item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        & p {
            margin: 0;
            font-size: 12px;
        }

        & input {
            height: 28px;
            margin: 0;
        }
    }

    button {
        font-size: 14px;
        padding: 8px 16px;
    }
`;

const ControlPannel = observer(({store}) => {
    return <StyledControlPannel>
        {
            !store.isLoggedIn && <>
                <div className="item">
                    <p>name</p>
                    <input value={store.userName} onChange={(e) => store.setUserName(e.target.value)}/>
                </div>
                <div className="item">
                    <p>password</p>
                    <input value={store.userPassword}
                           type="password"
                           onChange={(e) => store.setUserPassword(e.target.value)}/>
                </div>
                <button
                    onClick={() => {
                        store.login();
                    }}
                >
                    로그인
                </button>
            </>
        }
        {store.isLoggedIn && <button
                onClick={() => {
                    store.logout();
                }}
            >
                로그아웃
            </button>
        }
    </StyledControlPannel>
});


const StyledMessageField = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
    gap: 8px;
    position: relative;


    & input {
        flex: 1;
        height: 52px;
    }

`;

const MessageField = observer(({store}) => {
    return <StyledMessageField>
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >채팅보내기
        </div>
        <input value={store.message} onChange={(e) => store.setMessage(e.target.value)}/>
        <button
            onClick={() => {
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
    font-size: 14px;

    justify-content: ${props => {
        if (props.type === "agree")
            return "flex-end";
        else if (props.type === "disagree")
            return "flex-start";
        else
            return "center";
    }};

    padding: 8px;
`;

const ChatHistory = observer(({store}) => {
    const list = [...store.messages];

    return <>
        {
            list.map((item, index) => {
                return <StyledChatItem key={index} type={
                    (() => {
                        if (item.messageType === "TALK" && item.senderUserId !== -1)
                            return item.senderAgree ? "agree" : "disagree";
                        return "system";
                    })()
                }>
                    {item.messageType === "TALK" &&
                        <div>{item.senderUserId === -1 ? "사회자" : item.senderUserName} : {item.message}</div>}
                    {item.messageType === "ENTER" && <div>{item.senderUserName}님이 입장하셨습니다.</div>}
                    {item.messageType === "EXIT" && <div>{item.senderUserName}님이 퇴장하셨습니다.</div>}

                </StyledChatItem>
            })
        }
    </>

});

const StyledClient = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 36px;
    box-sizing: border-box;
    min-height: 0;

    & .content {
        flex: 1;
        flex-shrink: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        justify-content: end;
        box-sizing: border-box;
        min-height: 0;
    }
`;


function TimeLeftTimer({endTime}) {
    const [timeLeft, setTimeLeft] = useState(0);


    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(endTime - new Date());
        }, 100);

        return () => {
            clearInterval(timer);
        }
    }, [endTime, setTimeLeft]);


    // MM:SS:MS
    if (timeLeft <= 0)
        return <div>00:00:00</div>


    return <div>
        {Math.floor(timeLeft / 60000).toString().padStart(2, "0")}:
        {Math.floor(
            (timeLeft % 60000) / 1000
        ).toString().padStart(2, "0")}:
        {Math.floor(
            (timeLeft % 1000) / 100
        ).toString().padStart(1, "0")}
    </div>
}

const StyledDebateState = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
`;

const DebateState = observer(({store})=> {
    const stepName = [
        '토론 시작 전', '긍정 입론', '부정 질의 및 긍정 답변', '부정 입론', '긍정 질의 및 부정 답변', '긍정 반박', '부정 반박', '토론 종료'
    ]
    return <StyledDebateState>
        {
            store.state === "waiting" && <div>대기중 (모든 참가자가 참여완료하면 자동으로 시작됩니다)</div>
        }
        {
            store.state === "debating" &&
            <>
                {stepName[store.curStep]}
                <TimeLeftTimer endTime={store.stepEndTime}/>
            </>
        }
        {
            store.state === "finished" && <div>토론이 종료되었습니다.</div>
        }
    </StyledDebateState>
});

const StyledError = styled.div`
    text-align: center;
    color: red;
    font-size: 16px;
`

function Client() {
    const [store, setStore] = useState(() => new Store());
    const ScrollRef = useRef(null);

    useEffect(() => {
        setStore(new Store());
    }, [
        setStore, appStore.wsPath, appStore.debateRoomId
    ]);

    useEffect(() => {
        // Scroll to bottom
        ScrollRef.current.scrollTop = ScrollRef.current.scrollHeight;
    }, [store.messages, ScrollRef]);

    return (
        <StyledClient>
            <ControlPannel store={store}/>
            {
                store.errorMessage && <StyledError>
                    {store.errorMessage}
                </StyledError>
            }
            <DebateState store={store}/>
            <div className="content" ref={ScrollRef}>
                <ChatHistory store={store}/>
            </div>
            <MessageField store={store}/>
        </StyledClient>
    );
}

export default observer(Client);
