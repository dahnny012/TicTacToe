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
    
    this.findOpponent=function(playerId){
        for(var i=0; i<this.players.length; i++){
            if(this.players[i] !== playerId){
                var opp = this.players.splice(i,1);
                var you = this.players.splice(this.players.indexOf(playerId),1);
                return opp;
            }
        }
        return [];
            
    };
    this.matches = {};

};







exports.getQueue = getQueue;
