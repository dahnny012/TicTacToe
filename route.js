var fs = require("fs");
var url = require("url");
var game = require("./game");
var formidable = require("formidable");
var queue = require("./queue");
var route = require("./route");
var handler = require("./handler");
var utils = require("./utils");

route.kill = function(id){
    if(id[0] !== "/")
        id = "/" + id;
    console.log("Killing route " + id);
    route[id] = undefined;
};

route['/'] = function(req,res){
    fs.readFile('Views/index.html',function(err,data){
    if(err)
        res.end("error");
     res.writeHead(200,utils.mimeType("index.html"));
     res.end(data);
    });  
};

route['/leave'] = function(req,res){
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
                if(board.players.length < 1){
                    route.kill(fields.boardId);
                }
                console.log("Setting event");
                board.event.push({type:"leave",playerId:fields.playerId});
            }
            else{
                console.log("player was not in game");
            }
        }
        res.end("");
    });
};


route['/start'] = function(req,res){
    var form = new formidable.IncomingForm();
    var board = game.newGame();
    form.parse(req,function(error,fields){
        if(error)
            return;
        game.addPlayer(fields.playerId,board);
    });
    var boardId = board.id;
    if(route['/'+boardId] === undefined){
        route['/'+boardId] = handler.game;
        console.log("New Board");
        console.log("Creating a handler for /"+boardId);
        console.log(route['/'+boardId]);
        console.log(board);
    }
    res.end(boardId.toString());
};


route['/search'] = function(req,res){
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
            current.matches[fields.playerId] === undefined;
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
            if(route['/'+board.id] === undefined){
                route['/'+board.id] = handler.game;
                console.log("Creating a route");
                console.log(this['/'+board.id]);
            }
            current.matches[fields.playerId] =board.id;
            current.matches[search.pop()] = board.id;
            info = {playerToStart:fields.playerId,boardId:board.id};
            res.end(JSON.stringify(info));
        }else{
            res.end("Finding");
        }
    });

};
exports.route = route;