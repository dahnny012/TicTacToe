var app = 

app.controller("StartController",['$http',function($http){
		this.gameStarted = false;
		this.gameId = -1;
		
		// This is temporary
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
		
		this.initFromServer = function(){
			
		}
}]);