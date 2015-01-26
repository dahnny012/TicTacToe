(function(){
	var settings = {
		url:document.URL,
		boardId:document.URL.split("/").pop(),
		playerId: Math.floor(Math.random()*10000)
	};
	
	
	var app = angular.module("App",[]);
	
	
	app.directive("game",function(){
		return {
			restrict:'E',
			templateUrl:"Views/game.html"
		}
	});
	
	app.controller("StartController",['$http','$interval',function($http,$interval){
		this.gameStarted = false;
		this.gameId = -1;
		this.msg = "Welcome, how would you like to play?"
		
		//localStorage.setItem("playerId", randomId);
		console.log("Player ID " + settings.playerId);
		if(settings.boardId !== ""){
				this.gameId = settings.boardId;
				this.gameStarted = true;
				this.msg = "Game is in Progress";
				
				// Connect to game.
				$http.post("/"+settings.boardId,
				{type:"sync",playerId:settings.playerId})
				.success(function(data){
					console.log(data);
				});
				
				var update = function(http,row,settings){
				$interval(function(){
					http.post("/"+settings.boardId,{type:"update"}).success(
						function(data){
							console.log(data);
						});			
				},200);};
				update($http,this.view,settings);
		}
		// This is temporary
		
		this.findOpponent = function(){
			// send some sort of request.
			// wait for node to find someone.
			// connect 
			alert(settings.boardID);
		};
		this.customGame = function(){
			if(this.gameStarted == true)
				return;
			this.gameStarted = true;
			var status = $http.post("/start",{ 
				playerId: settings.playerId})
			.success(function(data){
				console.log("Board id "+ data);
				settings.boardId = data;
			});
			
			var update = function(http,row,settings){
				$interval(function(){
					http.post("/"+settings.boardId,{type:"update"}).success(
						function(data){
							console.log(data);
						});			
				},200);
			};
			update($http,this.view,settings);
		};
	}]);
	
	app.controller("GameController",["$http",
		function($http){
		this.view = game;
		
		this.turn = 0;
		this.gameOver = false;
		// Depends on who made it;
		this.yourTurn = true;
		
		this.play = function(x,y){
			if(this.view[x][y].square === ""
			&& !this.gameOver && this.yourTurn){
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
			this.sendMove(x,y,settings.boardId);
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
			$http.post("/"+gameID,
			{type:"move",
			playerId:settings.playerId,
			x:x,y:y}).success(
			function(data){
				console.log(data);
			});
			// setTimeout for a update.
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


