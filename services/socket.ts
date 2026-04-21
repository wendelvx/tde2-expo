import { io } from "socket.io-client";

// Substitua o 192.168.X.X pelo seu IPv4 real
const SOCKET_URL = "https://sand-folder-reserve-circuits.trycloudflare.com"; 

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Conectamos manualmente após o usuário colocar o Nickname
  transports: ['websocket'],
});