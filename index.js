var http = require("http");
var fs = require("fs");
var url = require("url");
var game = require("./game");
var formidable = require("formidable");
var queue = require("./queue");
<<<<<<< Updated upstream
var MAXPLAYERS = 2;
=======
var route = require("./route");
var utils = require("./utils");

>>>>>>> Stashed changes
http.createServer(function(req,res){
    var reqUrl = url.parse(req.url);
    console.log(reqUrl.path);
    if(route[reqUrl.path] === undefined){
        console.log("Undefined Route");
        reqUrl.path = utils.makeRelative(reqUrl.path);
        fs.readFile(reqUrl.path,function(err,data){
            if(err){
                console.log(err);
                res.writeHead(404,"text/plain");
                res.end("Page not found");
            }
            res.writeHead(200,utils.mimeType(reqUrl.path));
            res.end(data);
        });
        return;
    }
    console.log("Found a route");
    route[reqUrl.path](req,res);
}).listen(80);

<<<<<<< Updated upstream


/// Routes
=======
/*
>>>>>>> Stashed changes
var routes = {};
routes.kill = function(id){
    if(id[0] !== "/")
        id = "/" + id;
    console.log("Killing route " + id);
    routes[id] = undefined;
<<<<<<< Updated upstream
};

=======
}
>>>>>>> Stashed changes
routes['/'] = function(req,res){
  fs.readFile('Views/index.html',function(err,data){
      if(err)
        res.end("error");
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
    return link;
}
*/
