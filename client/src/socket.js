import { io } from "socket.io-client";
export const socket =
  process.env.NODE_ENV === "development" ? io("127.0.0.1:80") : io();
