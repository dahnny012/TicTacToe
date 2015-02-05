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
                setInterval(function(){
                    socket.emit("update");
                },500);
        }
        break;
        case 'move':
            var move ={playerId:msg.playerId,
            x:msg.x,y:msg.y,move:msg.move};
            board.history.push(move);
            board.lastMove = move;
        case 'update':
            var event = board.event.pop();
            if(event !== undefined){
                handle.event(event,socket);
            }else{
                game.addPlayer(msg.playerId,board);
                var update = JSON.stringify(board.lastMove);
                socket.to(board.id).emit("update",update);
            }
        break;
        case 'sync':
            console.log("sending sync");
            console.log("player "+ msg.playerId);
            game.addPlayer(msg.playerId,board);
            socket.emit("sync",JSON.stringify(board.history));
            break;
        case 'end':
            console.log("Ending game");
            if(board.getPlayer(msg.playerId) >= 0)
                board.endCounter++;
            if(board.endCounter >= 2){
                board.clear();
            }
    }
    return 1;
}

handle.event = function (event,socket){
    switch(event.type){
        case 'leave':
            var msg = {event:event.type};
            socket.emit('leave',JSON.stringify(msg));
            break;
    }
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
    app.get("/Views/game.html",function(req,res){
        fs.readFile('Views/game.html',function(err,data){
        res.writeHead(200,mimeType("game.html"));
        res.end(data);
    });});
});



/// Routes
var routes = {};
routes.kill = function(id){
    if(id[0] !== "/")
        id = "/" + id;
    console.log("Killing route " + id);
    routes[id] = undefined;
};

routes['/leave'] = function(req,res){
    console.log("Player sent a leave");
    var form = new formidable.IncomingForm();
    form.parse(req,function(error,fields){
        if(error)
            return;
        queue.removeFromQueue(queue.getQueue(),fields.playerId);
        if(fields.boardId !== undefined && fields.boardId !== "/"){
            console.log("Searching if player in game: " + fields.boardId);
            var board = game.searchGame(fields.boardId);
            // If game was found
            if(board !== undefined){
                board.removePlayer(fields.playerId);
                // Set a event in game.
                if(board.players.length < 1)
                    routes.kill(fields.boardId);
                board.event.push({type:"leave",playerId:fields.playerId});
            }
            else{
                console.log("player was not in game");
            }
        }
        res.end("");
    });
};


routes['/search'] = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(error,fields){
        if(error)
            return;
        // Get Queue
        var current = queue.getQueue();
        // If you havent found a match add yourself.
        if(current.matches[fields.playerId] === undefined){
            current.addPlayer(fields.playerId);
        }
        // If a match was found write i found one and give u the info.
        else{
            console.log("Other player found match");
            var info = {boardId:current.matches[fields.playerId]};
            current.matches[fields.playerId] = undefined;
            res.end(JSON.stringify(info));
        }
        console.log("In Queue");
        console.log(current.players);
        console.log(current.matches);
        // Search for someone.
        var search = queue.findOpponent(current,fields.playerId);
        if(search.length > 0){
            console.log("FOUND A MATCH");
            var board = game.newGame();
            if(routes['/'+board.id] === undefined){
                routes['/'+board.id] = handleGame;
                console.log("Creating a route");
                console.log(this['/'+board.id]);
            }
            
            current.addMatches(board.id,fields.playerId,search.pop());
            info = {playerToStart:fields.playerId,boardId:board.id};
            res.end(JSON.stringify(info));
        }else{
            res.end("Finding");
        }
    });

};




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