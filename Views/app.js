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
	
	
	app.factory('tictactoe',function(){
		return{
			lastMove: {x:-1,y:-1},
			init:function(controller){
				console.log("Init board");
				// Set board
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
				controller.view = array;
				
			},
			play:function(board,move){
				if(board[move.x][move.y].square === ""
				&& !game.over && game.playerTurn){
					console.log("Valid move");
					var player =  (game.turn % 2 == 0? "X" : "O");
					return this.playOne(board,player,move);
				}
			},
			playOne:function(board,player,move){
				console.log("Setting move");
				board[move.x][move.y].square = player;
				game.turn++;
				game.playerTurn = false;
				this.checkGameOver(board);
				return this.sendMove(move,settings.boardId,player);
			},
			sendMove:function(move,boardId,player){
				console.log("Sending move");
				move = {x:move.x,y:move.y,boardId:boardId,playerId:settings.playerId,move:player};
				this.lastMove = {x:move.x,y:move.y};
				return move;
			},
			checkGameOver:function(board,socket){
				var row = board;
				var draw = true;
				var tictactoe = this;
				for(var x=0; x<3; x++){
						this.checkRow(row,x);
						this.checkCol(row,x);
						// Check Draws
						for(var y=0; y<3; y++){
							if(row[x][y].square === "")
								draw = false;
						}
				}
						// Diags
				this.checkBackslash(row);
				this.checkForwardSlash(row);
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
						game.over = false;
						tictactoe.lastMove = {x:-1,y:-1};
					});
				}
			},
			checkRow:function(row,x){
			if(row[x][0].square === row[x][1].square 
			&& row[x][1].square === row[x][2].square
			&& row[x][0].square !== "")
				game.over = true;
			},
			checkCol:function(row,x){
				if(row[0][x].square === row[1][x].square
				&& row[1][x].square === row[2][x].square
				&& row[0][x].square !== "")
					game.over = true;
			},
			checkBackslash:function(row){
				if(row[0][0].square === row[1][1].square 
				&& row[1][1].square === row[2][2].square 
				&& row[0][0].square !== "")
					game.over = true;
			},
			checkForwardSlash:function(row){
				if(row[0][2].square === row[1][1].square 
				&& row[1][1].square === row[2][0].square 
				&& row[0][2].square !== "")
					game.over = true;
			}
		};
	});
	app.factory('rps',function(){
		return{
			init:function(){},
			play:function(){},
			playOne:function(){},
			isOver:function(){},
			sendMove:function(){}
		};
	});
	
	app.controller("StartController",
	function(socket,$interval){
		game.started = false;
		this.msg = "Welcome to TicTacToe online";
		var controller =  this;
		var lockout = false;

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
			if(game.started)
				return;
			setLeave();
			this.msg ="Currently in queue"
			var promise = $interval(function(){
				if(!lockout)
					socket.emit("queue",{playerId:settings.playerId});
			},100);
			socket.on("found match",function(msg){
			if(msg.boardId !== undefined){
						$interval.cancel(promise);
						alert("found a player");
						game.inQueue = false;
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
			setLeave();
		};
		
		this.join =  function(gameID){
			location.href="/"+gameID;
		};
		
		function setLeave(){
		window.addEventListener("beforeunload", function(e){
				lockout = true;
				socket.emit("leave",{playerId:settings.playerId,boardId:settings.boardId});
				var message = "Removing you from queue/game";
    			e.returnValue = message;
				return message;
		}, false);
		}
	});
	
	app.controller("GameController",
		function(socket,tictactoe){
		var lastMove = {x:-1,y:-1};
		var controller=  this;
		tictactoe.init(this,socket);
		console.log("view");
		console.log(this.view);
		this.getView = function(){
			return this.view;
		}
		this.turn = function(){
			if(game.playerTurn)
				return "your turn.";
			return "your opponent's turn.";
		}
		this.play = function(move){
			var msg = tictactoe.play(this.view,move);
			console.log("msg")
			console.log(msg);
			socket.emit("move",msg);
			
		}
		
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
			tictactoe.checkGameOver();
		});
		socket.on('leave',function(msg){
			alert("A player has left the game");
			console.log("Resetting the board");
			for(var y=0; y<3; y++){
						for(var x=0; x<3; x++){
							controller.view[y][x].square = "";
						}
			}
			game.playerTurn = false;
			game.started = false;
		});
		}
	);
})();



