import cors from "cors";
import express from "express";
import { Server } from "socket.io";

var app = express();

app.use(cors());
app.use(express.static("build"));

var port = process.env.PORT || 9000;
var server = app.listen(port, function () {
  console.log("listening for requests on port " + port);
});

let players: {
  socketId: string;
  name: string;
  role: string | undefined;
  voted: string | undefined;
  alive: boolean;
}[] = [];

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.sockets.on("connection", (socket) => {
  // console.log("Made socket connection ", socket.id);

  // Handle user disconnect event
  socket.on("disconnect", function () {
    // console.log(socket.id + " Got disconnected!");

    players = players.filter(function (x) {
      return x.socketId !== socket.id;
    });
    players.forEach((o) => {
      if (o.voted === socket.id) {
        o.voted === undefined;
      }
    });

    io.sockets.emit("user-update", players);
  });

  // Handle user joined event
  socket.on("user-joined", function (data) {
    const role = data.handle.toUpperCase() === "GOD" ? "god" : undefined;

    if (role === "god") {
      if (!!players.find((player) => player.role === "god")) {
        io.sockets.emit("user-update", players);
        return;
      }
    }

    players.push({
      socketId: socket.id,
      name: data.handle,
      role,
      voted: undefined,
      alive: true,
    });

    players = [
      ...new Map(players.map((player) => [player.socketId, player])).values(),
    ];

    io.sockets.emit("user-update", players);
  });

  socket.on("user-update", function (data) {
    let index = players.findIndex((x) => x.socketId === data.socketId);
    if (index !== -1) {
      players[index] = { ...players[index], ...data };

      players.forEach((player) => {
        if (player.alive !== true) {
          player.voted = undefined;
        }
      });

      io.sockets.emit("user-update", players);

      const votedGuys = players.filter((o) => {
        return o.role === "god" || o.voted !== undefined || o.alive !== true;
      }).length;
      if (votedGuys === players.length) {
        io.sockets.emit("voting-end");
      }
    }
  });

  socket.on("voting-start", () => {
    players = players.map((x) => {
      return {
        ...x,
        voted: undefined,
      };
    });
    io.sockets.emit("user-update", players);
    io.sockets.emit("voting-start", players);
  });

  socket.on("voting-end", () => {
    io.sockets.emit("voting-end", players);
  });

  socket.on("message", ({ message, toRole }) => {
    const from = players.find((o) => o.socketId === socket.id)?.name;
    const eligible = players
      .filter((o) => {
        return o.role === "god" || o.role === toRole || o.alive === false;
      })
      .map((o) => o.socketId);
    io.sockets.emit("message", {
      forSockets: eligible,
      message: message,
      from,
      channel: toRole,
    });
  });
});
