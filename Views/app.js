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
	
	 
	var app = angular.module("App",[]);
	app.factory('socket', function ($rootScope) {
	  var socket = io();
	  return {
	    on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
	  };
	});
	
	app.controller("StartController",
	function(socket,$interval){
		game.started = false;
		this.msg = "Welcome to TicTacToe online";
		var controller =  this;

		socket.on("join",function(msg){
			console.log(msg);
			settings.boardId = msg.boardId;
			game.started = true;
			game.playerTurn = true;
			controller.msg = "Your room: danhnguyen.ddns.net/"+msg.boardId;
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
			this.msg ="Currently in queue"
			var promise = $interval(function(){
				socket.emit("queue",{playerId:settings.playerId});
			},100);
			socket.on("found match",function(msg){
			if(msg.boardId !== undefined){
						$interval.cancel(promise);
						alert("found a player");
						game.inQueue = false;
						/// After you recieve a board ID
						if(game.started == true)
							return;
						game.started = true;
						if(msg.playerToStart !== undefined)
							game.playerTurn = true;
						settings.boardId = msg.boardId;
						controller.msg = "Game has started"
			}});
		};
		this.customGame = function(controller){
			if(game.started == true)
				return;
			game.started = true;
			game.playerTurn = true;
			socket.emit('custom',{playerId:settings.playerId});
		};
		
		this.join =  function(gameID){
			location.href="/"+gameID;
		};
		
		window.addEventListener("beforeunload", function(e){
				socket.emit("leave",{playerId:settings.playerId,boardId:settings.boardId});
				var message = "Removing you from queue/game";
    			e.returnValue = message;
				return message;
		}, false);
	});
	
	app.controller("GameController",
		function(socket){
		var controller=  this;
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
			this.sendMove(x,y,settings.boardId,player);
		};
		
		this.sendMove = function(x,y,boardId,player){
			// Valid move
			var move = {x:x,y:y,boardId:boardId,playerId:settings.playerId,move:player};
			lastMove = {x:x,y:y};
			socket.emit("move",move);
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
				alert("Game is over");
				socket.emit("end",{playerId:settings.playerId,boardId:settings.boardId});
				socket.on("reset",function(msg){
					console.log("Resetting the board");
					for(var y=0; y<3; y++){
						for(var x=0; x<3; x++){
							row[y][x].square = "";
						}
					}
					game.started == true;
					game.over = false;
					lastMove = {x:-1,y:-1};
				});
			}
		};
		socket.on('update',function(msg){
			console.log("Received a update");
			console.log(msg);
			if(msg == undefined)
				return;
			if(msg.x == undefined || msg.y == undefined)
				return;
			if(lastMove.x == msg.x && lastMove.y == msg.y)
				return;
			controller.view[msg.x][msg.y].square = msg.move;
			lastMove = msg;
			game.playerTurn = true;
			game.turn++;
			controller.checkGameOver();
		});
		socket.on('leave',function(msg){
			alert("A player has left the game");
			game.playerTurn = false;
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



