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
	
	app.controller("StartController",['$http',function($http){
		this.gameStarted = false;
		this.gameId = -1;
		localStorage.setItem("playerId", "player1");
		this.findOpponent = function(){
			// send some sort of request.
			// wait for node to find someone.
			// connect 
		};
		this.customGame = function(){
			this.gameStarted = true;
			this.gamecode = "gg";
			
			
			
			var status = $http.post("/start",{ 
				playerId: localStorage.getItem("playerId")}).
			success(function(data){
				console.log(data);
				this.gameId = data;
			});
		};
	}]);
	
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


