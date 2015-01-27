(function(){
	var settings = {
		url:document.URL,
		boardId:document.URL.split("/").pop(),
		playerId: Math.floor(Math.random()*10000)
	};
	
	var game = {
		started:false,
		turn:0,
		playerTurn:false,
		over:false
	};
	var app = angular.module("App",[]);
	
	
	app.directive("game",function(){
		return {
			restrict:'E',
			templateUrl:"Views/game.html"
		}
	});
	
	app.controller("StartController",['$http','$interval',function($http,$interval){
		game.started = false;
		this.gameStarted = function(){
			return game.started;
		};
		this.msg = "Welcome, how would you like to play?"
		console.log("Player ID " + settings.playerId);
		if(settings.boardId !== ""){
				game.started = true;
				this.msg = "Game is in Progress";
		}
		
		this.findOpponent = function(){
			// send some sort of request.
			// wait for node to find someone.
			// connect 
			alert(settings.boardID);
		};
		this.customGame = function(){
			if(game.started == true)
				return;
			game.started = true;
			game.playerTurn = true;
			var status = $http.post("/start",{ 
				playerId: settings.playerId})
			.success(function(data){
				console.log("Board id "+ data);
				settings.boardId = data;
			});
		};
	}]);
	
	app.controller("GameController",["$http","$interval",
		function($http,$interval){
		this.view = board;
		var lastMove = {x:-1,y:-1};
		// Connect
		var update = function(http,row,settings){
			$interval(function(){
				if(game.started){
				http.post("/"+settings.boardId,{type:"update"}).success(
					function(data){
						console.log(data);
						if(data === undefined || data.length < 1)
							return;
						if(data.playerId == settings.playerId)
							return;
						if(data.x == lastMove.x && data.y == lastMove.y)
							return
						if(data.x !== undefined && data.y !== undefined){
							console.log("Data added");
							row[data.x][data.y].square = data.move;
							lastMove = data;
							game.playerTurn = true;
							game.turn++;
						}
					});
				}
			},300);};
		update($http,this.view,settings);
		
		this.play = function(x,y){
			if(this.view[x][y].square === ""
			&& !game.over && game.playerTurn){
				console.log(game.turn);
				var player =  (game.turn % 2 == 0? "X" : "O");
				this.playOne(player,x,y);
				this.checkGameOver();
			}
		};
		
		this.playOne = function(player,x,y){
			console.log(this.view);
			console.log("X " + x +" Y " + y);
			this.view[x][y].square = player;
			game.turn++;
			game.playerTurn = false;
			this.sendMove(x,y,settings.boardId,player);
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
			if(game.over)
				console.log("GG");
		};
		
		this.checkRow = function(row,x){
			if(row[x][0].square === row[x][1].square 
			&& row[x][1].square === row[x][2].square
			&& row[x][0].square !== "")
				game.over = true;
		};
		this.checkCol = function(row,x){
			if(row[0][x].square === row[1][x].square
			&& row[1][x].square === row[2][x].square
			&& row[0][x].square !== "")
				game.over = true;
		};
		this.checkBackslash = function(row){
			if(row[0][0].square === row[1][1].square 
			&& row[1][1].square === row[2][2].square 
			&& row[0][0].square !== "")
				game.over = true;
		};
		
		this.checkForwardSlash = function(row){
			if(row[0][2].square === row[1][1].square 
			&& row[1][1].square === row[2][0].square 
			&& row[0][2].square !== "")
				game.over = true;
		}
		this.sendMove = function(x,y,gameID,player){
			$http.post("/"+gameID,
			{type:"move",
			playerId:settings.playerId,
			x:x,y:y,move:player}).success(
			function(data){
				console.log(data);
			});
		};
		
	}]);
	
	
	var board = init();

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


