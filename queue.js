var queue = undefined;

function getQueue(){
    if(queue === undefined)
        queue = new makeQueue();
    return queue;
};


function makeQueue(){
    this.players= [];
    this.addPlayer = function(playerId){
        if(this.players.indexOf(playerId) !== -1)
            return this;
         this.players.push(playerId);
    };
    
    this.searchGame=function(playerId){
        for(var i=0; i<this.players.length; i++){
            if(this.players[i] !== playerId)
                var opp = this.players[i].splice(i,1);
                var you = this.players[i].splice(this.players.indexOf(playerId),1);
                return opp;
        }
            
    };
    this.matches = {};

};







exports.getQueue = getQueue;
