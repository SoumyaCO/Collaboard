import { io } from "socket.io-client"
import Cookies from "js-cookie"

const Server_Url = import.meta.env.VITE_API_KEY

export const createSocket = () => {
    const username = localStorage.getItem("username")
    const fullname = localStorage.getItem("fullname")
    const dp_url = localStorage.getItem("dp_url")

    let token = Cookies.get("authToken")

    return io(Server_Url, {
        autoConnect: false,
        auth: {
            token: token,
            username: username,
            fullname: fullname,
            dp_url: dp_url,
        },
    })
}
export const socketClient = createSocket()
const emitDrawing = (socket, data) => {
    socketClient.emit("on-drawing", data)
}

export { emitDrawing }
