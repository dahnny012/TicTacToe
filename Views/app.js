(function(){
	var app = angular.module("App",[]);
	app.controller("GameController",function(){
		this.view = game;
		this.play = function(x,y){
			if(this.turn){
				console.log(this.view);
				console.log("X " + x +" Y " + y);
				this.view[x][y].square = "X"
				this.turn = false;
				this.sync(x,y,this.gameID);
			}
		}
		this.sync = function(x,y,gameID){
			// Send info
			// wait for info.
		};
		this.turn = false;
	});
	
	app.controller("StartController",function(){
		this.gameStarted = false;
		this.findOpponent = function(){
			// send some sort of request.
			// wait for node to find someone.
			// connect 
		};
		this.customGame = function(){
			// Start game , give link to player
		};
	});
	
	var game = init();

	function init(){
		var array = [3];
		var id = 0;
		for(var j=0; j<3; j++){
			array[j] = [3];
			for(var i =0; i<3; i++){
				array[j][i] = {square:"",x:j,y:i};
				id++;
			}
		}
		console.log(array);
		return array;
	};
})();


