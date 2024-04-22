import { makeAutoObservable,runInAction } from 'mobx';

export default class Store {

    socket = null;

    wsPath = 'ws://localhost:8080/ws/chat';

    userId = 0;
    userName = '';
    debateRoomId = 0;
    isAgree = true;
    curStep = 0;
    stepEndTime = 0;

    state = "waiting";
    messages = [];
    message = "";

    errorMessage = null;


    constructor() {
        makeAutoObservable(this);
    }

    setWsPath(wsPath) {
        this.wsPath = wsPath;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    setUserName(userName) {
        this.userName = userName;
    }

    setDebateRoomId(debateRoomId) {
        this.debateRoomId = debateRoomId;
    }

    setIsAgree(isAgree) {
        this.isAgree = isAgree;
    }

    setCurStep(curStep) {
        this.curStep = curStep;
    }

    setStepEndTime(stepEndTime) {
        this.stepEndTime = stepEndTime;
    }

    setMessage(message) {
        this.message = message;
    }


    connect() {
        runInAction(()=>{
            this.errorMessage = null;
        });
        try {
            this.socket = new WebSocket(this.wsPath);

            // catch connection fail
            this.socket.onerror = (error) => {
                console.error('Connection failed');
                runInAction(()=>{
                    this.socket = null;
                    this.errorMessage = `Connection failed : ${this.wsPath}`;
                });
            }

            this.socket.onopen = () => {
                console.log('Connected to server');

                this.socket.send(JSON.stringify({
                    type: "ENTER",
                    debateRoomId: this.debateRoomId,
                    userId: this.userId,
                    userName: this.userName,
                    isAgree: this.isAgree,
                    message: "",
                }));
            }

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Message received:', data);
                runInAction(()=>{
                    if(data.type === "StepChange") {
                        if(event.step === 7) {
                            this.state = "finished";
                        }else {
                            this.state = "debating";
                        }
                        this.curStep = data.step;
                        this.stepEndTime = new Date(data.endTime);
                    }else{
                        this.messages = [
                            ...this.messages,
                            data
                        ]
                    }

                });
            }

            this.socket.onclose = () => {
                console.log('Connection closed');
                runInAction(()=>{
                    this.socket = null;
                    this.errorMessage = 'Connection closed';
                });
            }
        } catch (e) {
            runInAction(()=>{
                this.errorMessage = e.message;
            });
        }
    }

    sendMessage() {
        this.socket?.send(JSON.stringify({
            type: "TALK",
            debateRoomId: this.debateRoomId,
            userId: this.userId,
            userName: this.userName,
            isAgree: this.isAgree,
            message: this.message
        }));
    }

    exit() {
        this.socket?.send(JSON.stringify({
            type: "QUIT",
            debateRoomId: this.debateRoomId,
            userId: this.userId,
            userName: this.userName,
            isAgree: this.isAgree,
            message: ""
        }));
        this.socket?.close();
        this.socket = null;
    }
}