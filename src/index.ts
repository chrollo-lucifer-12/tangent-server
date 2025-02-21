import { WebSocketServer } from "ws";
import { User } from "./class/user";
import { RoomManager } from "./class/room-manager";

const wss = new WebSocketServer({port: 8080});

const roomManager = new RoomManager();

wss.on("connection", (ws) => {
  ws.on("message", function(message) {
    const parsedData =  JSON.parse(message.toString());
    console.log(parsedData);
    if (parsedData.type === "join_room") {
      const user = new User(ws, parsedData.email);
      roomManager.addUser(user,parsedData.workspaceId);
    }
  });
});

console.log("WebSocket server running on port 8080");