var queue = undefined;

function getQueue(){
    if(queue === undefined)
        queue = new makeQueue();
    //setInterval(queue.manageQueue,500,queue);
    return queue;
};


function makeQueue(){
    this.players= [];
    this.addPlayer = function(playerId){
        var search = this.players.indexOf(playerId);
        if(search !== -1){
            this.watchList[search].pingTime = 2000;
            return this;
        }
         this.players.push(playerId);
         this.watchList.push({playerId:playerId,pingTime:1000});
    };
    
    this.findOpponent=function(playerId){
        for(var i=0; i<this.players.length; i++){
            if(this.players[i] !== playerId){
                var opp = this.players.splice(i,1);
                var playerIndex = this.players.indexOf(playerId);
                this.players.splice(playerIndex,1);
                this.watchList.splice(playerIndex,1);
                return opp;
            }
        }
        return [];
            
    };
    this.matches = {};
    this.watchList = [];

};

function manageQueue(queue){
    var currentTime = Date.getTime();
    for(var i=0; i<queue.watchList.length; i++){
        if(currentTime- queue.watchList.pingTime > 3000){
            queue.watchList.player.splice(i,1);
            queue.players.splice(i,1);
        }
    }
}






exports.getQueue = getQueue;
