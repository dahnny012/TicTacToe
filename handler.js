var fs = require("fs");
var url = require("url");
var game = require("./game");
var formidable = require("formidable");
var queue = require("./queue");
var route = require("./route");
var utils = require("./utils");

var handler = {};

handler.game=function(req,res){
    var reqUrl = url.parse(req.url);
    var board = game.searchGame(reqUrl.path);
    //console.log(board);
    var form = new formidable.IncomingForm();
    //console.log(req.method);
    if(req.method === 'POST'){
        console.log("request is POST")
        form.parse(req,function(error,fields){
            handler.post(error,fields,board,res);
        });
    }
    else{
        fs.readFile('Views/index.html',function(err,data){
            res.writeHead(200,utils.mimeType("index.html"));
            res.end(data);
        });
    }
};


handler.event=function(event,res){
    switch(event.type){
        case 'leave':
            var msg = {event:event.type};
            res.end(JSON.stringify(msg));
            break;
    }
}

handler.post=function(error,fields,board,res){
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
                handler.event(event,res);
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
            if(board.players.indexOf(fields.playerId) >= 0)
                board.endCounter++;
            if(board.endCounter >= 2){
                console.log("Clearing")
                board.clear();
            }
            res.end("End");
    }
    //console.log(board);
}




exports.handler = handler;


