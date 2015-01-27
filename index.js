var http = require("http");
var fs = require("fs");
var url = require("url");
var game = require("./game");
var formidable = require("formidable");
http.createServer(function(req,res){
    var reqUrl = url.parse(req.url);
    if(routes[reqUrl.path] === undefined){
        reqUrl.path = makeRelative(reqUrl.path);
        fs.readFile(reqUrl.path,function(err,data){
            if(err){
                console.log(err);
                res.writeHead(404,"text/plain");
                res.end("Page not found");
            }
            res.writeHead(200,mimeType(reqUrl.path));
            res.end(data);
        });
        return;
    }
    routes[reqUrl.path](req,res);
}).listen(80);

var routes = {};
routes['/'] = function(req,res){
  fs.readFile('Views/index.html',function(err,data){
      res.writeHead(200,mimeType("index.html"));
      res.end(data);
  });  
};

routes['/start'] = function(req,res){
    var form = new formidable.IncomingForm();
    var board = game.newGame();
    form.parse(req,function(error,fields){
        if(error)
            return;
        game.addPlayer(fields.playerId,board);
    });
    var boardId = board.id;
    if(this['/'+boardId] === undefined){
        this['/'+boardId] = handleGame;
        console.log("added handler");
        console.log("New Board");
        console.log(board);
    }
    res.end(boardId.toString());
};

routes['/search'] = function(req,res){
    res.end("Bar");
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
            console.log("sending update");
            res.writeHead(200,"application/json");
            // Temporary.
            game.addPlayer(fields.playerId,board);
            res.end(JSON.stringify(board.lastMove));
            break;
        case "sync":
            console.log("sending sync");
            console.log("player "+ fields.playerId);
            game.addPlayer(fields.playerId,board);
            res.writeHead(200,"application/json");
            console.log(JSON.stringify(board.history));
            res.end(JSON.stringify(board.history));
        case "end":
            console.log("Ending game");
            if(board.players.indexOf(fields.playerId) >= 0)
                board.endCounter++;
            if(board.endCounter >= 2){
                console.log("Clearing")
                board.clear();
            }
                
    }
    console.log(board);
}


function handleGame(req,res){
    var reqUrl = url.parse(req.url);
    var board = game.searchGame(reqUrl.path);
    console.log(board);
    var form = new formidable.IncomingForm();
    //console.log(req.method);
    if(req.method === 'POST'){
        console.log("request is POST")
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

