import { WebSocket } from "ws"

export class User {
 ws : WebSocket
     userName : string

    constructor (ws : WebSocket,userName : string) {
        console.log("new user connected")
        this.ws = ws
        this.userName = userName
    }
}


