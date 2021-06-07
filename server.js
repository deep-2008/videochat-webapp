const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
// Peer

if (process.env.NODE_ENV === "development") {
  console.log("Development");
  var portForPeer=3000
  var portUsing=3000
}
if (process.env.NODE_ENV === "production") {
  console.log("Production");
  var portUsing=process.env.PORT;
  var portForPeer=443
}
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, rsp) => {
  rsp.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room,portForPeer:portForPeer });
});

// app.post("/leave", (req, res) => {
//   res.send("congrats you have successfully left the meeting")
// })

io.on("connection", (socket) => {
  console.log("I am in")
  socket.on("join-room", (roomId, userId) => {
    console.log("Join room on event")
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
      console.log(message);
    });
    
    socket.on('disconnect',()=>{
      console.log("User disconnected");
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    })

  });
  
});

server.listen(portUsing,function(req,res){
  console.log("Server running at port",portUsing)
});
