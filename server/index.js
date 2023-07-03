const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const socket = require("socket.io");
const mongoose = require('mongoose');
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

dotenv.config({ path: "./config.env" });

const app = express();

app.use(express.json());
app.use(cors({
    origin : ["http://localhost:3000", "https://chat-app-real-time.vercel.app"],
    credentials: true, 
}));

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connected Successfull");
    })
    .catch((err) => {
        console.log(err.message);
    });

app.get("/", (req, res) => res.send("Hello welcome to my Chat APP"));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const port = process.env.PORT || 8080;

const server = app.listen(port, () =>
    console.log(`Server started on ${port}`)
);

const io = socket(server, {
    cors: {
        origin: "https://chat-app-real-time.vercel.app",
        credentials: true,
    },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
});