import express from "express";
import axios from "axios";
import { Server } from 'socket.io';
import cors from "cors";
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const server = createServer(app);



const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173", // Replace with your frontend URL
        methods: ["GET", "POST"],
    },
    path: "/socket.io"
});

let rooms = [];
let waitingUsers = [];
let timers = [];
let last = {};
let Time = [];
let userInfo = [];
const MAX = 3;
const MIN = 2;
const time = 30; // fetch this from fronted with the help of socket 

const creationRoom = () => {
    const roomID = uuidv4();
    rooms[roomID] = [];
    timers[roomID] = [];
    userInfo[roomID] = [];
    return roomID;
}

const addUserToRoom = (roomID, user, Name) => {
    rooms[roomID].push(user);
    io.to(user).emit("info", rooms[roomID].length);
    userInfo[roomID].push({ id: user, Name });
    io.sockets.sockets.get(user).join(roomID);
};

const GetWords = async () => {
    const isMulti = 1;
    const { data } = await axios.post("http://localhost:3000/api/words", {
        time,
        isMulti
    });
    return data.words;
}



io.on("connection", async (socket) => {
    // console.log("User Connected", socket.id);
    socket.emit("connected", socket.id);
    socket.on("Waiting", async (Name) => {
        waitingUsers.push({ user: socket.id, Name });
        // console.log(waitingUsers);
        if (waitingUsers.length == MIN) {
            const roomID = creationRoom();
            const words = await GetWords();

            while (waitingUsers.length > 0) {
                const { user, Name } = waitingUsers.shift();
                // console.log(Name);
                addUserToRoom(roomID, user, Name);
            }

            // Timer Starts After Meeting Minimum Creteria
            timers[roomID] = 8;
            const timeInterval = setInterval(() => {
                timers[roomID] = timers[roomID] - 1;
                if (timers[roomID] <= 1) {
                    last = {};
                    // console.log(roomID);
                    io.to(roomID).emit("StartGame");
                    io.to(roomID).emit("time", 30);
                    clearInterval(Time.shift());
                }
                io.to(roomID).emit("RemStartTime", timers[roomID]);
            }, 1000);
            Time.push(timeInterval);
            last = { roomID, words };
            io.to(roomID).emit("StartTimer");
            // console.log("users", userInfo[roomID]);
            io.to(roomID).emit('joinRoom', { roomId: roomID, roomUsers: userInfo[roomID] });
            io.to(roomID).emit("words", words);
        }
        else if (last.roomID && last.words) {
            // console.log("lastRoom2 ");
            const { user, Name } = waitingUsers.shift();
            addUserToRoom(last.roomID, user, Name);
            io.to(last.roomID).emit('joinRoom', { roomId: last.roomID, roomUsers: userInfo[last.roomID] });
            io.to(last.roomID).emit("words", last.words);
            if (rooms[last.roomID].length == MAX) {
                last = {};
            }
        }
    })
    // socket.on("info", ({ socketId, userName }) => {
    //     userInfo.map(user => {
    //         if (user.socketId == socketId) {
    //             return {
    //                 ...user,
    //                 name: userName,
    //             }
    //         }
    //     })
    // });

    // console.log(waitingUsers, last);

    socket.on(
        "another",
        (data) => {
            // console.log(data);
            io.to(data.roomId).emit("another", { id: data.id, progress: data.progress });
        }
    );

    socket.on('disconnect', () => {
        // console.log(`User disconnected: ${socket.id}`);
        waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);
        // Remove user from rooms and clean up empty rooms
        for (const room in rooms) {
            rooms[room] = rooms[room].filter((id) => id !== socket.id);
            if (rooms[room].length === 0) {
                if (last.roomID == room) last = {};
                delete rooms[room];
                clearTimeout(timers[room]);
                delete timers[room];
                delete userInfo[room];
            }
        }
    });
})


export { server, app };
