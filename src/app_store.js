import {makeAutoObservable} from "mobx";

export class AppStore {
    wsPath = 'ws://localhost:8080/ws/chat';
    debateRoomId = 0;

    constructor() {
        makeAutoObservable(this);
    }

    setWsPath(wsPath) {
        this.wsPath = wsPath;
    }

    setDebateRoomId(debateRoomId) {
        this.debateRoomId = debateRoomId;
    }
}


const appStore = new AppStore();

export default appStore;