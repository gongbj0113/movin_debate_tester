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

                this.socket.send({
                    type: "ENTER",
                    debateRoomId: this.debateRoomId,
                    userId: this.userId,
                    userName: this.userName,
                    isAgree: this.isAgree,
                    message: "",
                });
            }

            this.socket.onmessage = (event) => {
                runInAction(()=>{
                    if(event.type === "StepChange") {
                        if(event.step === 7) {
                            this.state = "finished";
                        }else {
                            this.state = "debating";
                        }
                        this.curStep = event.step;
                        this.stepEndTime = new Date(event.endTime);
                    }else{
                        this.messages.push(event);
                    }

                });
            }
        } catch (e) {
            runInAction(()=>{
                this.errorMessage = e.message;
            });
        }
    }

    sendMessage(message) {
        this.socket?.send({
            type: "TALK",
            debateRoomId: this.debateRoomId,
            userId: this.userId,
            userName: this.userName,
            isAgree: this.isAgree,
            message: message
        });
    }

    exit() {
        this.socket?.send({
            type: "EXIT",
            debateRoomId: this.debateRoomId,
            userId: this.userId,
            userName: this.userName,
            isAgree: this.isAgree,
            message: ""
        });
        this.socket?.close();
        this.socket = null;
    }
}