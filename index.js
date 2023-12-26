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

const MAXIMUM_USERS_NUM = process.env.MAXIMUM_USERS_NUM || 4;

let rooms = {};
let socketToRoom = {};

io.on("connection", (socket) => {

    socket.on("create_room", (data, callback) => {

    });

    socket.on("enter_room", (data, callback) => {
        // when there is no room in the rooms, then insert new room into rooms.
        if(rooms[data.room_num] == undefined)
        {
            const newRoomInfo = {
                room_num: data.room_num,
                users: [], // store socket ids
            };
            rooms[data.room_num] = newRoomInfo;
        }

        // room is full
        if(rooms[data.room_num].users.length == MAXIMUM_USERS_NUM)
        {
            socket.to(socket.id).emit("room_full");
            return;
        }
        
        // join
        rooms[data.room_num].users.push({ socket_id: socket.id });
        socketToRoom[socket.id] = data.room_num;

        socket.join(data.roomNum);

        const remainUsers = rooms[data.room_num].users.filter((user) => 
            user.socket_id != socket.id
        );
        io.to(socket.id).emit("remain_users", {remainUsers: remainUsers});
    });

    socket.on('send_offer', (data, callback) => {
        const target_socket_id = data.receiveSocketId;
        io.to(target_socket_id).emit("receive_offer", data);
    });

    socket.on('send_answer', (data, callback) => {
        const target_socket_id = data.receiveSocketId;
        io.to(target_socket_id).emit("receive_answer", data);
    });

    socket.on("candidate", (data, callback) => {
        const target_socket_id = data.receiveSocketID;
        io.to(target_socket_id).emit("receive_candidate", data);
    });

    // socket fires disconnect event
    socket.on('disconnect', () => {
        let room_num = socketToRoom[socket.id];
        if(rooms[room_num] != undefined)
        {
            const new_room_users = rooms[room_num].users.filter(
                (user) => user.socket_id != socket.id
            );
            delete socketToRoom[socket.id];

            if(new_room_users.length == 0)
            {
                delete rooms[room_num];
                return;
            }
            else
            {
                rooms[room_num].users = new_room_users;
                socket.broadcast.emit("user_exit", { socket_id: socket.id });
            }
        }
    });



});

const PORT = 5000 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`[+] Server is running on ${PORT}...`);
})