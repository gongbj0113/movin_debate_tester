import {makeAutoObservable, runInAction} from 'mobx';
import appStore from "./app_store";
import axios from "axios";

export default class Store {
    socket = null;

    userName = "";
    userPassword = "";
    isLoggedIn = false;
    token = "";

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

    setDebateRoomId(debateRoomId) {
        this.debateRoomId = debateRoomId;
    }

    setUserName(userName) {
        this.userName = userName;
    }

    setUserPassword(userPassword) {
        this.userPassword = userPassword;
    }

    login() {
        runInAction(() => {
            this.errorMessage = null;
        });

        // use axios
        axios.post('http://localhost:8080/auth/v1/login', {
            userName: this.userName,
            password: this.userPassword,
        })
            .then(response => {
                console.log('Success:', response);
                runInAction(() => {
                    this.token = response.data.token;
                    this.isLoggedIn = true;
                    this.errorMessage = null;
                });
                this.connect();
            })
            .catch((error) => {
                console.error('Error:', error);
                runInAction(() => {
                    this.isLoggedIn = false;
                    this.errorMessage = "로그인 실패"
                });

        })

        // fetch('http://localhost:8080/auth/v1/login', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Access-Control-Allow-Origin': '*',
        //     },
        //     body: JSON.stringify({
        //         userName: this.userName,
        //         password: this.userPassword,
        //     }),
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('Success:', data);
        //         runInAction(() => {
        //             this.token = data.token;
        //             this.isLoggedIn = true;
        //             this.errorMessage = null;
        //         });
        //         this.connect();
        //     })
        //     .catch((error) => {
        //         console.error('Error:', error);
        //         runInAction(() => {
        //             this.isLoggedIn = false;
        //             this.errorMessage = "로그인 실패"
        //         });
        //     });
    }

    logout() {
        this.isLoggedIn = false;
        this.token = "";
        this.exit();
    }

    setMessage(message) {
        this.message = message;
    }


    connect() {
        if (!this.isLoggedIn) {
            runInAction(() => {
                this.errorMessage = "로그인이 필요합니다";
                this.socket?.close();
                this.socket = null;
            });
            return;
        }

        runInAction(() => {
            this.errorMessage = null;
        });
        try {
            this.socket = new WebSocket(appStore.wsPath);

            // catch connection fail
            this.socket.onerror = (error) => {
                console.error('Connection failed');
                runInAction(() => {
                    this.socket = null;
                    this.errorMessage = `Connection failed : ${appStore.wsPath}`;
                });
            }

            this.socket.onopen = () => {
                console.log('Connected to server');

                this.socket.send(JSON.stringify({
                    type: "ENTER",
                    debateRoomId: appStore.debateRoomId,
                    message: "",
                    token: this.token
                }));
            }

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Message received:', data);
                runInAction(() => {
                    if (data.type === "StepChange") {
                        if (event.step === 7) {
                            this.state = "finished";
                        } else {
                            this.state = "debating";
                        }
                        this.curStep = data.step;
                        this.stepEndTime = new Date(data.endTime);
                    } else {
                        this.messages = [
                            ...this.messages,
                            data
                        ]
                    }

                });
            }

            this.socket.onclose = () => {
                console.log('Connection closed');
                runInAction(() => {
                    this.socket = null;
                    this.errorMessage = 'Connection closed';
                });
            }
        } catch (e) {
            runInAction(() => {
                this.errorMessage = e.message;
            });
        }
    }

    sendMessage() {
        this.socket?.send(JSON.stringify({
            type: "TALK",
            debateRoomId: this.debateRoomId,
            message: this.message,
            token: this.token
        }));
    }

    exit() {
        this.socket?.close();
        this.socket = null;
    }
}