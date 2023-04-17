var http = require('http');
var io = require('socket.io');
var fs = require("fs");


var server = http.createServer(function(req,res){
    fs.readFile(__dirname + "/index.html",function(err,data){
        if(err){
            res.writeHead(404);
            res.end("File not Found");
        } else {
            res.writeHead(200);
            res.end(data);
        }
    })
});

var io = new io.Server(server, {

});
io.on('connection', async function(socket){
    console.log("A user Connected " + socket.id)
    io.to(socket.id).emit('message', {message:'A Little Color Picker'});


    socket.on('change-color', (color)=>{
        io.to(socket.id).emit('message', {message:'Color changed!'});
        io.emit('change-color', (color));
    });

    socket.on('disconnect', function () {
       console.log('A user disconnected');
    });
});

server.listen(3000);
console.log('Server running at 3000!')
