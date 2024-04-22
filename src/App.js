import {useEffect, useState} from "react";
import styled from "styled-components";
import Client from "./Client";

const StyledApp = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    padding: 36px;
    gap: 18px;
    box-sizing: border-box;
    
    & .client {
        flex:1;
        flex-shrink: 0;
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 36px;
        min-height: 0;
        
        & > div:first-child {
            font-size: 18px;
            font-weight: 600;
        }
        
        & > div:last-child {
           flex:1;
            display: flex;
            flex-direction: column;
        }
  }
    
    & .divider {
        width: 1px;
        background-color: #000000;
        height: 100%;
        margin: 0 36px;
    }
`;


function TimeLeftTimer({endTime}) {
    const [timeLeft, setTimeLeft] = useState(endTime - new Date());


    useEffect(() => {
        const timer = setInterval(()=>{
            setTimeLeft(endTime - new Date());
        }, 100);

        return () => {
            clearInterval(timer);
        }
    }, []);

    // MM:SS:MS
    if(timeLeft <= 0)
        return <div>00:00:00</div>

    return <div>
        {Math.floor(timeLeft/1000/60).toString().padStart(2, "0")}:
        {Math.floor(timeLeft/1000%60).toString().padStart(2, "0")}:
        {Math.floor(timeLeft%1000).toString().padStart(3, "0")}
    </div>
}

const StyledDebateState = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items:center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
`;
function DebateState({store}) {
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
                {stepName[store.step]}
                <TimeLeftTimer endTime={store.stepEndTime}/>
            </>
        }
    </StyledDebateState>
}

function App() {


  return (
      <StyledApp>
        <div className="client">
            <div>
                Client 1
            </div>
            <div>
                <Client/>
            </div>
        </div>
          <div className="divider"/>
        <div className="client">
            <div>
                Client2
            </div>
            <div>
                <Client/>
            </div>
        </div>
    </StyledApp>
  );
}

export default App;
