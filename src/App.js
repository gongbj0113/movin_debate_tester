import styled from "styled-components";
import Client from "./Client";
import {observer} from "mobx-react-lite";
import appStore from "./app_store";

const StyledApp = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 36px;
    gap: 36px;
    box-sizing: border-box;

    & .clients {
        flex: 1;
        display: flex;
        flex-direction: row;
        gap: 18px;
    }

    & .client {
        flex: 1;
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
            flex: 1;
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

const StyledInfoSection = styled.div`
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

const InfoSection = observer(() => {
    return <StyledInfoSection>
        <div className="item">
            <p>ws path</p>
            <input value={appStore.wsPath} onChange={(e) => appStore.setWsPath(e.target.value)}/>
        </div>
        <div className="item">
            <p>debateRoomId</p>
            <input value={appStore.debateRoomId} type="number"
                   onChange={(e) => appStore.setDebateRoomId(isNaN(+e.target.value) ? 0 : +e.target.value)}/>
        </div>
    </StyledInfoSection>;
});

function App() {
    return (
        <StyledApp>
            <InfoSection/>
            <div className="clients">
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
            </div>
        </StyledApp>
    );
}

export default App;
