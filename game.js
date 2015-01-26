var boards = {};
function randomNum(){
    return Math.floor(Math.random()*10000);
}
function newGame(){
    var id = randomNum();
    if(boards[id] === undefined)
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
}

function board(id){
    this.id=id;
    this.players = [2];
    // moves placed in here.
    this.history = [];
    return this;
};

function addPlayer(playerId,board){
    for(var i=0; i<2; i++){
        if(board.players[i] !== undefined){
            board.players[i] = playerId;
            break;
        }
    }
    return board;
};





exports.newGame = newGame;
exports.searchGame = searchGame;
exports.addPlayer = addPlayer;