var express = require("express");
var cors = require("cors");

var app = express();

app.use(cors());
app.use(express.static("build"));

var port = process.env.PORT || 9000;
var server = app.listen(port, function () {
  console.log("listening for requests on port " + port);
});

let online = [];

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.sockets.on("connection", (socket) => {
  // console.log("Made socket connection ", socket.id);

  // Handle user disconnect event
  socket.on("disconnect", function () {
    var entry = online.find(function (element) {
      return String(element.socketId) === socket.id;
    });

    // console.log(socket.id + " Got disconnected!");

    online = online.filter(function (x) {
      return x.socketId !== socket.id;
    });
    online.forEach((o) => {
      if (o.voted === socket.id) {
        o.voted === undefined;
      }
    });

    io.sockets.emit("user-update", online);
  });

  // Handle user joined event
  socket.on("user-joined", function (data) {
    const role = data.handle.toUpperCase() === "GOD" ? "god" : undefined;
    online.push({
      socketId: socket.id,
      name: data.handle,
      role,
      voted: undefined,
      alive: true,
    });
    io.sockets.emit("user-update", online);
  });

  socket.on("user-update", function (data) {
    let index = online.findIndex((x) => x.socketId === data.socketId);
    online[index] = { ...online[index], ...data };
    io.sockets.emit("user-update", online);

    const votedGuys = online.filter((o) => {
      return o.role === "god" || o.voted !== undefined || o.alive !== true;
    }).length;
    if (votedGuys === online.length) {
      io.sockets.emit("voting-end");
    }
  });

  socket.on("voting-start", () => {
    online = online.map((x) => {
      return {
        ...x,
        voted: undefined,
      };
    });
    io.sockets.emit("user-update", online);
    io.sockets.emit("voting-start", online);
  });

  socket.on("voting-end", () => {
    io.sockets.emit("voting-end", online);
  });

  socket.on("message", ({ message, toRole }) => {
    const from = online.find((o) => o.socketId === socket.id).name;
    const eligible = online
      .filter((o) => {
        return o.role === "god" || o.role === toRole;
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
