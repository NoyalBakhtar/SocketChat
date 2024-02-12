const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Store online users
const onlineUsers = new Set();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve your HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');
 // Listen for the 'set username' event from the client
  socket.on('set username', (username) => {
 // Add user to online users set with their username
    onlineUsers.add(username);
  });
   // Emit the updated online users list to all clients
    io.emit('online users', Array.from(onlineUsers));

    // Listen for 'chat message' events from clients
    socket.on('chat message', (data) => {
        // Broadcast the message to all connected clients
        io.emit('chat message', { message: data.message, sender: 'received', userName: data.userName });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');

        // Find and remove user from online users set using their username
        const usernameToRemove = Array.from(onlineUsers).find(username => io.sockets.sockets[socket.id].username === username);
        onlineUsers.delete(usernameToRemove);

       // Emit the updated online users list to all clients
       io.emit('online users', Array.from(onlineUsers));
      });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
