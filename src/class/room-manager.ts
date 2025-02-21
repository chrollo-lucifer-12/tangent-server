import { User } from "./user";

type Payload = {
    workspaceId: string
    folder: any
    type: "add_folder"
} | {
    type: "add_page",
    page: any,
    workspaceId: string
} | {
    type: "add_member",
    memberEmail: string,
    workspaceId: string
} | {
    type: "update_editor",
    data: any,
    workspaceId: string,
    folderId: string,
    fileId: string
} | {
    type: "update_nodes",
    workspaceId: string,
    folderId: string,
    fileId: string,
    nodes: any,
    edges: any
} | {
    type: "update_edges",
    workspaceId: string,
    folderId: string,
    fileId: string,
    nodes: any,
    edges: any
}

export class RoomManager {
    private rooms: Map<string, Set<User>>

    constructor() {
        this.rooms = new Map();
    }

    private notifyUsers(payload: Payload) {
        const room = this.rooms.get(payload.workspaceId)
        if (room) {
            room.forEach((user) => {
                switch (payload.type) {
                    case "add_folder":
                        user.ws.send(JSON.stringify({
                            type: payload.type,
                            workspaceId: payload.workspaceId,
                            folder: payload.folder
                        }))
                        break;
                    case "add_page":
                        user.ws.send(JSON.stringify({
                            type: payload.type,
                            page: payload.page,
                            workspaceId: payload.workspaceId
                        }))
                        break
                    case "add_member":
                        user.ws.send(JSON.stringify({
                            type: payload.type,
                            workspaceId: payload.workspaceId,
                            email: payload.memberEmail
                        }))
                        break
                    case "update_editor":
                        user.ws.send(JSON.stringify({
                            type: payload.type,
                            workspaceId: payload.workspaceId,
                            folderId: payload.folderId,
                            fileId: payload.fileId,
                            data: payload.data
                        }))
                        break
                    case "update_nodes":
                        user.ws.send(JSON.stringify({
                            type: payload.type,
                            workspaceId: payload.workspaceId,
                            folderId: payload.folderId,
                            fileId: payload.fileId,
                            nodes: payload.nodes,
                            edges: payload.edges
                        }))
                        break
                    case "update_edges":
                        user.ws.send(JSON.stringify({
                            type: payload.type,
                            workspaceId: payload.workspaceId,
                            folderId: payload.folderId,
                            fileId: payload.fileId,
                            nodes: payload.nodes,
                            edges: payload.edges
                        }))
                        break
                    default:
                        break;
                }
            })
        }
    }

    private addHandler(user: User) {
        user.ws.on("message", (data : any) => {
            const message = JSON.parse(data.toString());
            //user.sendMessage(message);
            let messagePayload: Payload
            if (message.type === "send_message") {
                //this.notifyUsers();
            }
            if (message.type === "add_folder") {
                messagePayload = { workspaceId: message.workspaceId, folder: message.folder, type: message.type }
                //this.notifyUsers(messagePayload)
            }
            if (message.type === "add_page") {
                messagePayload = { workspaceId: message.workspaceId, page: message.page, type: message.type }
            }
            if (message.type === "add_member") {
                messagePayload = { workspaceId: message.workspaceId, memberEmail: message.email, type: message.type }
            }
            if (message.type === "update_editor") {
                messagePayload = { workspaceId: message.workspaceId, fileId: message.fileId, folderId: message.folderId, data: message.data, type: "update_editor" }
            }
            if (message.type === "update_nodes") {
                messagePayload = { workspaceId: message.workspaceId, fileId: message.fileId, folderId: message.folderId, nodes: message.nodes, edges: message.edge, type: "update_nodes" }
            }
            if (message.type === "update_edges") {
                messagePayload = { workspaceId: message.workspaceId, fileId: message.fileId, folderId: message.folderId, nodes: message.nodes, edges: message.edge, type: "update_edges" }
            }
            if (messagePayload!) this.notifyUsers(messagePayload);
        })

        user.ws.on("close", () => {
            this.updateStatus(user, false);
        })
    }

    updateStatus(user: User, status: boolean) {
        let room: string | undefined;
        for (const [workspaceId, users] of this.rooms) {
            if (users.has(user)) {
                room = workspaceId;
                break
            }
        }
        if (status) {
            console.log(`${user.userName} is now online in ${room}`);
            if (room) {
                this.rooms.get(room)?.forEach((user) => {
                    user.ws.send(JSON.stringify({
                        type: "status",
                        userupdated: user.userName,
                        status: true
                    }))
                })
            }
        }
        else {
            console.log(`${user.userName} is now offline in ${room}`);
            if (room) {
                this.rooms.get(room)?.forEach((user) => {
                    user.ws.send(JSON.stringify({
                        type: "status",
                        user: user.userName,
                        status: false
                    }))
                })
                this.rooms.get(room)?.delete(user);
            }
        }
    }

    addUser(user: User, workspaceId: string) {
        this.addHandler(user);
        if (!this.rooms.has(workspaceId)) {
            this.rooms.set(workspaceId, new Set());
        }
        this.rooms.get(workspaceId)?.add(user)
        this.updateStatus(user, true);
    }
}