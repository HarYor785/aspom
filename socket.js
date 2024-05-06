// socket.js

import { createServer } from 'http';
import { Server } from 'socket.io';

const initSocket = (app) => {
    const expressServer = createServer(app);
    const io = new Server(expressServer, {
        cors: {
            origin: ["https://hrms.aspomportal.com", "https://admin.aspomportal.com", "http://localhost:3000", "http://localhost:3001"]
        }
    });
    // const io = new Server(expressServer, {
    //     cors: {
    //         origin: ["http://localhost:3000", "http://localhost:3001"]
    //     }
    // });

    // Attach io to the request object (optional)
    app.set('io', io);

    let activeUsers = []
    
    io.on('connection', (socket) => {
        app.set('socket', socket);

        socket.on('new-user', (newUser) => {
            if(!activeUsers.some((user) => user.user === newUser)) {
                activeUsers.push({
                    user: newUser,
                    socketId: socket.id,
                    status: 'online'
                })
                // socket.broadcast.emit('user-connected', user);
                console.log('Connected users', activeUsers);
                io.emit('get-users', activeUsers)
            }

        })
        
        socket.on('disconnect', ()=>{
            const userIndex = activeUsers.findIndex((user) => user.socketId === socket.id)
            if (userIndex !== -1) {
                const user = activeUsers[userIndex];
                user.status = 'offline';
                activeUsers.splice(userIndex, 1);
                io.emit('user-disconnected', user);
                io.emit('get-users', activeUsers);
                console.log('disConnected users', activeUsers);
            }
        })

        socket.on('send-message', (data)=>{
            const {receiverId} = data
            const getUser = activeUsers.find((user)=>user.user === receiverId)
            if(getUser){
                socket.to(getUser.socketId).emit('receive-message', data)
                console.log('Sent a message:', data)
                console.log('Sent a message:', getUser.socketId)
            }
        })

        socket.on('notification', (data) => {
            // Broadcast the notification to all clients
            io.emit('receive-notification', data);
        });
        socket.on('create-post', (data) => {
            // Broadcast the notification to all clients
            io.emit('receive-post', data);
        });
        socket.on('comment-post', (data) => {
            // Broadcast the notification to all clients
            io.emit('receive-comment', data);
        });

        console.log('a user connected', socket.id);
    });

    return expressServer;
};

export default initSocket;
