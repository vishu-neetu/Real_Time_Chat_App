const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// varibale to be  used
const botName = 'ChatCord Bot';

// Its runs when client gets connected
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room })=>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);


        // Welcome message to the client
        socket.emit('message', formatMessage(botName, 'Welcome to my chat application'));

        // Broadcast when a user is connected
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} have joined the chat`));

        // send user and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    
    // Listen for chatMessage
    socket.on('chatMessage', (msg)=> {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} have left the chat`));
        
        // Send user and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
        
        }
    
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));