var http = require("http");
var fs = require("fs");
var url = require("url");
var game = require("./game");
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



var routes = {};
routes['/'] = function(req,res){
  fs.readFile('index.html',function(err,data){
      res.writeHead(200,mimeType("index.html"));
      res.end(data);
  });  
};

routes['/start'] = function(req,res){
    var creatorId = 5;
    var board = game.newGame();
    game.addPlayer(creatorId,board);
    var boardId = board.id;
    this['/'+boardId] = function(req,res){
        console.log("this worked");
        res.end("You've Reached A Board");
    }
    res.end(boardId.toString());
};
routes['/search'] = function(req,res){
    res.end("Bar");
};
