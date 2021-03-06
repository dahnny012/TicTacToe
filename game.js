var boards = {};
function randomNum(){
    return Math.floor(Math.random()*10000);
}
function newGame(){
    var id = randomNum();
    while(boards[id] !== undefined)
        id = randomNum();
    boards[id] = new board(id);
    return boards[id];
};

function searchGame(boardId){
    boardId = makeRelative(boardId);
    return boards[boardId];
};
function makeRelative(link){
    if(link[0] == "/")
        return link.slice(1);
    return link;
};

function board(id){
    this.id=id;
    this.players = new Array(2);
    // moves placed in here.
    this.history = [];
    this.lastMove = undefined;
    this.clear=  function(){
        this.history = [];
        this.lastMove = undefined;
    };
    this.removePlayer = function(playerId){
        var index = this.getPlayer(playerId);
        if(index != -1)
            this.kickPlayer(index);
    };
    
    this.getPlayer = function(playerId){
      return this.players.indexOf(playerId);  
    };
    
    this.kickPlayer = function(index){
        this.players.splice(index,1);
    }
    this.event = [];
    this.isEmpty = function(){
        return this.players[0] == undefined 
        && this.players[1] == undefined
    }
    return this;
};

function addPlayer(playerId,board,socket){
    if(board.players.indexOf(playerId) !== -1)
        return board;
    for(var i=0; i<2; i++){
        if(board.players[i] === undefined){
            console.log("Adding player");
            board.players[i] = playerId;
            if(socket !== undefined)
                socket.join(board.id);
            console.log(board);
            return "added";
        }
    }
    return board;
};










exports.newGame = newGame;
exports.searchGame = searchGame;
exports.addPlayer = addPlayer;