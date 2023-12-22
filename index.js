const express = require("express");
const cors = require("cors");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.use(cors());

io.on("connection", (socket) => {
    console.log(socket);
    console.log("a user connected");
    
    // socket fires disconnect event
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

const PORT = 5000 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`[+] Server is running on ${PORT}...`);
})