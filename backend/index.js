var http = require('http').createServer();
const io = require('socket.io')(http)

io.on('connection', (socket) => {
    console.log("New Connection");
    socket.on('message', (messageObj) => {
        const { body, sender, name } = messageObj;
        console.log('Message from: ' + name + ": " + sender);
        socket.broadcast.emit('message', messageObj);
    });
})

http.listen(3001, () => {
      console.log('listening on *:3001');
});
