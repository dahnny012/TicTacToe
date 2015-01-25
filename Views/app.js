(function(){
	var app = angular.module("App",[]);
	app.controller("GameController",["$http",function($http){
		this.view = game;
		this.turn = 0;
		this.gameOver = false;
		// Depends on who made it;
		this.yourTurn = true;
		this.play = function(x,y){
			if(this.view[x][y].square === ""
			&& !this.gameOver && this.youTurn){
				var player =  (this.turn % 2 ? "O" : "X");
				this.playOne(player,x,y);
				this.checkGameOver();
			}
		}
		this.playOne = function(player,x,y){
			console.log(this.view);
			console.log("X " + x +" Y " + y);
			this.view[x][y].square = player;
			this.turn++;
			this.yourTurn = false;
			this.sendMove(x,y,this.gameID);
		};
		
		this.checkGameOver = function(){
			var row = this.view;
			for(var x=0; x<3; x++){
					// Rows 
					this.checkRow(row,x);
					this.checkCol(row,x);
			}
					// Diags
			this.checkBackslash(row);
			this.checkForwardSlash(row);
			if(this.gameOver)
				console.log("GG");
		};
		
		this.checkRow = function(row,x){
			if(row[x][0].square === row[x][1].square 
			&& row[x][1].square === row[x][2].square
			&& row[x][0].square !== "")
				this.gameOver = true;
		};
		this.checkCol = function(row,x){
			if(row[0][x].square === row[1][x].square
			&& row[1][x].square === row[2][x].square
			&& row[0][x].square !== "")
				this.gameOver = true;
		};
		this.checkBackslash = function(row){
			if(row[0][0].square === row[1][1].square 
			&& row[1][1].square === row[2][2].square 
			&& row[0][0].square !== "")
				this.gameOver = true;
		};
		
		this.checkForwardSlash = function(row){
			if(row[0][2].square === row[1][1].square 
			&& row[1][1].square === row[2][0].square 
			&& row[0][2].square !== "")
				this.gameOver = true;
		}
		this.sendMove = function(x,y,gameID){
			$http.post("/"+gameID,{x:x,y:y}).success(function(data){
				console.log(data);
			});
			// wait for info.
		};
		
		this.sync = function(x,y,gameID){
			
		};
	}]);
	
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


