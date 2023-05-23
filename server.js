const express = require('express');
var http = require('http');
var io = require('socket.io');
const config = require('./config/default.json');
const linkRepo = require("./repos/linkRepo");
const userRepo = require("./repos/userRepo");

const app = express();
var server = http.createServer(app);

app.get("/", (req, res) => {
    res.send("test");
});

var io = new io.Server(server, {

});

io.on('connection', async function(socket){
    console.log("A user Connected " + socket.id);

    //users
    socket.on('create-user', async function(email, username, password){
        const res = await userRepo.create(email, username, password);
        io.to(socket.id).emit('created-user', await res);
    });

    socket.on('user-login', async function (email, password) {
        const res = await userRepo.getByEmailAndPassword(email, password);
        if(await res.rowCount !== 0) {
            io.to(socket.id).emit('user-login', {rowCount: res.rowCount, user: res.rows[0] ,isRightUsernameAndPassword:true});
        } else {
            io.to(socket.id).emit('user-login', {rowCount: 0, isRightUsernameAndPassword:false});
        }
    });

    //links
    socket.on('create-link', async function (name, link, isVisible, userId){
        const res = await linkRepo.create(name, link, isVisible, userId);
        io.to(socket.id).emit("created-link", res.rows[0]);
    });

    socket.on('get-all-links-by-user-id', async function(userId) {
        const res = await linkRepo.getAllByUserId(userId);
        io.to(socket.id).emit("got-all-links-by-user-id", await res);
    });

    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});

server.listen(config.server.port);
