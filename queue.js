var queue = undefined;
var queueLock = false;
function getQueue(){
    if(queue === undefined)
        queue = new makeQueue();
    setInterval(manageQueue,500,queue);
    return queue;
};


function makeQueue(){
    this.players= [];
    this.addPlayer = function(playerId){
        var search = this.players.indexOf(playerId);
        if(search !== -1){
            this.watchList[search].pingTime = Math.floor(new Date());
            return this;
        }
         this.players.push(playerId);
         this.watchList.push({playerId:playerId,pingTime:new Date()});
    };
    
    this.matches = {};
    this.watchList = [];
    this.kick = function(playerIndex){
        this.players.splice(playerIndex,1);
        this.watchList.splice(playerIndex,1);
    };
    this.addMatches = function(boardId,playerId,search){
            this.matches[playerId] =boardId;
            this.matches[search] = boardId;
    }

};

function findOpponent(queue,playerId){
    if(!queueLock){
        getLock();
        queue = getQueue();
        var opp = [];
        for(var i=0; i<queue.players.length; i++){
            if(queue.players[i] !== playerId){
                opp = queue.players.splice(i,1);
                var playerIndex = queue.players.indexOf(playerId);
                queue.kick(playerIndex);
                break;
            }
        }
        releaseLock();
        return opp;
    }else{
        setTimeout(findOpponent,5,queue,playerId);
    }
};

function manageQueue(queue){
    if(!queueLock){
        getLock();
        queue = getQueue();
    var currentTime = Math.floor(new Date());
    for(var i=0; i<queue.watchList.length; i++){
        if(currentTime - queue.watchList[i].pingTime > 3000){
            console.log("Removing player from queue");
            queue.kick(i);
        }
    }
        releaseLock();
    }else{
        setTimeout(manageQueue,5,queue);
    }
};

function removeFromQueue(queue,playerId){
    if(!queueLock){
        getLock();
        queue = getQueue();
        console.log("Removing from queue : " + playerId);
        var index = queue.players.indexOf(playerId);
        if(index != -1){
            queue.kick(index);
        }
        releaseLock();
    }else{
        setTimeout(removeFromQueue,5,queue,playerId);
    }
};


function releaseLock(){
    queueLock = false;
}
function getLock(){
    queueLock = true;
}


exports.removeFromQueue = removeFromQueue;
exports.getQueue = getQueue;
exports.findOpponent = findOpponent;