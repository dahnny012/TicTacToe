var app = require("express")()
var http = require("http").Server(app)
var fs = require("fs");
var url = require("url");
var game = require("./game");
var formidable = require("formidable");
var queue = require("./queue");
var io = require("socket.io")(http);
var INPROGRESS = 1;


io.on('connection',function(socket){
   socket.on('custom',function(msg){
        var board = game.newGame();
        game.addPlayer(msg.playerId,board);
        if(routes['/'+board.id] === undefined){
            app.get("/"+board.id,handleGame);
            routes['/'+board.id] = INPROGRESS;
            console.log(board);
            socket.emit("join",{boardId:board.id});
            socket.join(board.id);
        }
   });
   socket.on('move',function(msg){
       
   });
   socket.on('update',function(msg) {
   })
});



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

routes['/'] = function(req,res){
  fs.readFile('Views/index.html',function(err,data){
      res.writeHead(200,mimeType("index.html"));
      res.end(data);
  });  
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


routes['/start'] = function(req,res){
    var board = game.newGame();
    var form = new formidable.IncomingForm();
    form.parse(req,function(error,fields){
        if(error)
            return;
        game.addPlayer(fields.playerId,board);
    });
    if(routes['/'+board.id] === undefined){
        routes['/'+board.id] = handleGame;
        console.log("New Board");
        console.log(board);
    }
    res.end(board.id.toString());
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



function handlePost(error,fields,board,res){
    if(error)
        return;
    switch(fields.type){
        case "move":
            console.log("Making a move on board");
            var move ={playerId:fields.playerId,
            x:fields.x,y:fields.y,move:fields.move};
            board.history.push(move);
            board.lastMove = move;
            res.end("Move ok");
            break;
        case "update":
            //console.log("sending update");
            res.writeHead(200,"application/json");
            // Temporary.
            var event = board.event.pop();
            if(event !== undefined){
                handleEvent(event,res);
            }else{
                game.addPlayer(fields.playerId,board);
                res.end(JSON.stringify(board.lastMove));
            }
            break;
        case "sync":
            console.log("sending sync");
            console.log("player "+ fields.playerId);
            game.addPlayer(fields.playerId,board);
            res.writeHead(200,"application/json");
            console.log(JSON.stringify(board.history));
            res.end(JSON.stringify(board.history));
            break;
        case "end":
            console.log("Ending game");
            if(board.getPlayer(fields.playerId) >= 0)
                board.endCounter++;
            if(board.endCounter >= MAXPLAYERS){
                console.log("Clearing");
                board.clear();
            }
            res.end("End");
    }
    //console.log(board);
}

function handleEvent(event,res){
    switch(event.type){
        case 'leave':
            var msg = {event:event.type};
            res.end(JSON.stringify(msg));
            break;
    }
}


function handleGame(req,res){
    var reqUrl = url.parse(req.url);
    var board = game.searchGame(reqUrl.path);
    //console.log(board);
    var form = new formidable.IncomingForm();
    //console.log(req.method);
    if(req.method === 'POST'){
        form.parse(req,function(error,fields){
            handlePost(error,fields,board,res);
        });
    }
    else{
        fs.readFile('Views/index.html',function(err,data){
            res.writeHead(200,mimeType("index.html"));
            res.end(data);
        });
    }
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