const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("a user connected");
    
    // socket fires disconnect event
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.addListener(PORT, () => {
    console.log(`[+] Server is running on ${PORT}...`);
})