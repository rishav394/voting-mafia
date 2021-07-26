import { io } from "socket.io-client";
export const socket =
  process.env.NODE_ENV === "development" ? io("http://3.7.183.63:9000/") : io();
