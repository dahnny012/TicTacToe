var app = require("express")()
var http = require("http").Server(app)
var fs = require("fs");
var url = require("url");
var game = require("./game");
var formidable = require("formidable");
var queue = require("./queue");
var io = require("socket.io")(http);
var INPROGRESS = 1;



// Redirects io events to handlers
io.on('connection',function(socket){
   socket.on('custom',function(msg){
        var board = game.newGame();
        handle.msg('custom',socket,msg,board);
   });
   socket.on('move',function(msg){
       handle.msg('move',socket,msg);
   });
   socket.on('update',function(msg) {
       handle.msg('update',socket,msg);
   });
   socket.on('sync',function(msg){
       handle.msg('sync',socket,msg);
   })
   socket.on('end',function(msg){
       handle.msg('end',socket,msg);
   });
   
   socket.on('queue',function(msg){
       handle.queue('queue',socket,msg); 
   });
   socket.on('leave',function(msg){
       handle.disconnect('leave',socket,msg);
   });
   socket.on('wait',function(msg){
       handle.msg('wait',socket,msg);
   })
});

var handle = {};
handle.game = function(req,res){
    fs.readFile('Views/index.html',function(err,data){
        res.writeHead(200,mimeType("index.html"));
        res.end(data);
    });
};
handle.msg = function(type,socket,msg,board){
    if(board == undefined)
        board = game.searchGame(msg.boardId);
    switch(type){
        case 'custom':
            game.addPlayer(msg.playerId,board);
            if(routes['/'+board.id] === undefined){
                app.get("/"+board.id,handle.game);
                routes['/'+board.id] = INPROGRESS;
                console.log(board);
                socket.emit("join",{boardId:board.id});
                socket.join(board.id);
        }
        break;
        case 'move':
            console.log("Recieved move command");
            var move ={playerId:msg.playerId,move:msg.move};
            board.history.push(move);
            board.lastMove = move;
            console.log(board);
        case 'update':
            var event = board.event.pop();
            if(event !== undefined){
                handle.event(event,socket);
            }else{
                var status = game.addPlayer(msg.playerId,board,socket);
                var update = board.lastMove;
                if(status == "added"){
                    socket.emit("update",update);
                }else{
                    socket.to(board.id).emit("update",update);   
                }
            }
        break;
        case 'wait':
            console.log("Waiting for both players");
            board.history.push(msg);
            console.log(board);
            if(board.history.length >= msg.wait){
                io.to(board.id).emit("end wait",{board:board.history});
            }
            break;
        case 'sync':
            console.log("sending sync");
            console.log("player "+ msg.playerId);
            game.addPlayer(msg.playerId,board);
            socket.emit("sync",board.history);
            break;
        case 'end':
            console.log("Ending game");
            board.clear();
            socket.emit("reset");
            break;
    }
    return 1;
}


handle.queue = function(type,socket,msg){
    console.log("Player queuing " + msg.playerId);
     var current = queue.getQueue();
     // If you havent found a match add yourself.
        if(current.matches[msg.playerId] === undefined){
            current.addPlayer(msg.playerId);
        }
        else{
            console.log("Other player found match");
            var info = {boardId:current.matches[msg.playerId]};
            current.matches[msg.playerId] = undefined;
            socket.join(info.boardId);
            socket.emit("found match",info);
            return;
        }
        console.log("In Queue");
        console.log(current.players);
        console.log(current.matches);
        var search = queue.findOpponent(current,msg.playerId);
        if(search.length > 0){
            console.log("FOUND A MATCH");
            var board = game.newGame();
            if(routes['/'+board.id] === undefined){
                app.get("/"+board.id ,handle.game);
                console.log("Creating a route");
            }
            current.addMatches(board.id,msg.playerId,search.pop());
            current.matches[msg.playerId] = undefined;
            info = {playerToStart:msg.playerId,boardId:board.id};
            socket.join(info.boardId);
            socket.emit("found match",info);
        }
}


handle.disconnect = function(event,socket,msg){
    console.log("Player sent a leave");
        queue.removeFromQueue(queue.getQueue(),msg.playerId);
        if(msg.boardId !== undefined && msg.boardId !== "/"){
            console.log("Searching if player in game: " + msg.boardId);
            var board = game.searchGame(msg.boardId);
            if(board !== undefined){
                console.log("killing board");
                board.removePlayer(msg.playerId);
                handle.kill(msg.boardId);
                socket.to(board.id).emit("leave");
                socket.leave(board.id);
            }
            else{
                console.log("player was not in game");
            }
        }
}


handle.event = function (event,socket){
    switch(event.type){
        case 'leave':
            var msg = {event:event.type};
            socket.emit('leave',msg);
            break;
    }
}

handle.kill = function(board){
    routes["/"+board.id]=  undefined;
    board = undefined;
}


http.listen("80",function(){
    app.get("/",function(req,res){
        fs.readFile('Views/index.html',function(err,data){
        res.writeHead(200,mimeType("index.html"));
        res.end(data);
    });});
    app.get("/Views/app.js",function(req,res){
        fs.readFile('Views/app.js',function(err,data){
        res.writeHead(200,mimeType("app.js"));
        res.end(data);
    });}); 
    app.get("/Views/app.css",function(req,res){
        fs.readFile('Views/app.css',function(err,data){
        res.writeHead(200,mimeType("app.css"));
        res.end(data);
    });}); 

   
});



/// Routes
var routes = {};

//// Utils
function mimeType(link){
    link = link.split(".");
    link = link.pop();
    switch(link){
        case 'js':
            return 'text/javascript';
        case 'css':
            return 'text/css';
        case 'html':
            return 'text/html'
        default:
            return 'text/plain';
    }
};

function makeRelative(link){
    if(link[0] == "/")
        return link.slice(1);
}