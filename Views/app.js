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
		over:false,
		inQueue:false
	};
	
	var socket = io();
	var app = angular.module("App",[]);
	
	
	app.directive("game",function(){
		return {
			restrict:'E',
			templateUrl:"Views/game.html"
		}
	});
	
	
	app.controller("StartController",['$http','$interval',"$scope",
	function($interval,$scope){
		game.started = false;
		this.msg = "Welcome, how would you like to play?";
		var controller = this;
		socket.on("join",function(msg){
			console.log(msg);
			settings.boardId = msg.boardId;
			game.started = true;
			game.playerTurn = true;
		});
		
		this.gameStarted = function(){
			return game.started;
		}
		


		if(settings.boardId !== ""){
				game.started = true;
				this.msg = "Game is in Progress";
				socket.emit("update",{boardId:settings.boardId,
				playerId:settings.playerId});
		}
		
		this.findOpponent = function(){
			// Socket things
		};
		this.customGame = function(controller){
			if(game.started == true)
				return;
			game.started = true;
			game.playerTurn = true;
			socket.emit('custom',{playerId:settings.playerId});
			var promise = $interval(function(){
			},100);
		};
		
		this.join=  function(gameID){
			location.href="/"+gameID;
		};
	}]);
	
	app.controller("GameController",
		function(){
		this.view = board;
		var lastMove = {x:-1,y:-1};
		
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
			this.sendMove(x,y,settings.boardId);
		};
		
		this.sendMove = function(x,y,boardId){
			// Valid move
			var move = {x:x,y:y,boardId:boardId,playerId:settings.playerId}
		};
		
		this.checkGameOver = function(){
			var row = this.view;
			var draw = true;
			for(var x=0; x<3; x++){
					// Rows 
					checkRow(row,x);
					checkCol(row,x);
					// Check Draws
					for(var y=0; y<3; y++){
						if(row[x][y].square === "")
							draw = false;
					}
			}
					// Diags
			checkBackslash(row);
			checkForwardSlash(row);
			if(draw)
				game.over = true;
			if(game.over){
				//game.started = false;
				alert("Game is over");
				// transmit a end
				// reset the board
			}
		};
		socket.on('update',function(msg){
			// Recieve last move
			// Do some checks
			// update the board with last move
			if(game.over){
			//	game.started = false Unsure about this
				// transmit a end
				// reset the board
			};
		});
		}
	);
	
	
	var board = init();
	
	
	//TODO Move to this to a tictactow module
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
	function checkRow(row,x){
	if(row[x][0].square === row[x][1].square 
	&& row[x][1].square === row[x][2].square
	&& row[x][0].square !== "")
		game.over = true;
	};
	function checkCol(row,x){
		if(row[0][x].square === row[1][x].square
		&& row[1][x].square === row[2][x].square
		&& row[0][x].square !== "")
			game.over = true;
	};
	function checkBackslash(row){
		if(row[0][0].square === row[1][1].square 
		&& row[1][1].square === row[2][2].square 
		&& row[0][0].square !== "")
			game.over = true;
	};
			
	function checkForwardSlash(row){
		if(row[0][2].square === row[1][1].square 
		&& row[1][1].square === row[2][0].square 
		&& row[0][2].square !== "")
			game.over = true;
	};
})();



