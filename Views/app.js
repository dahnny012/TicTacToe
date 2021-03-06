(function(){
	var settings = {
		url:document.URL,
		boardId:document.URL.split("/").pop(),
		playerId: Math.floor(Math.random()*10000)
	};
	var TICTACTOE = 0;
	var RPS = 1;
	var game = {
		started:false,
		turn:0,
		playerTurn:false,
		over:false,
		inQueue:false,
		list:[TICTACTOE,RPS],
		lastMove:{x:-1,y:-1}
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
	      });
	    }
	  };
	});
	
	
	app.factory('tictactoe',function(){
		return{
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
			play:function(board,move,socket){
				if(board[move.x][move.y].square === ""
				&& !game.over && game.playerTurn){
					console.log("Valid move");
					var player =  (game.turn % 2 == 0? "X" : "O");
					this.playOne(board,player,move,socket);
				}
			},
			playOne:function(board,player,move,socket){
				console.log("Setting move");
				board[move.x][move.y].square = player;
				game.turn++;
				game.playerTurn = false;
				this.checkGameOver(board,socket);
				this.sendMove(move,settings.boardId,player,socket);
			},
			sendMove:function(move,boardId,player,socket){
				console.log("Sending move");
				game.lastMove = {x:move.x,y:move.y};
				var msg = {boardId:boardId,playerId:settings.playerId,move:{x:move.x,y:move.y,value:player}};
				socket.emit("move",msg);
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
			update:function(board,socket,msg){
				if(msg == undefined || msg.move == undefined || msg.move.x == undefined ||
				msg.move.y == undefined)
					return;
				if(game.lastMove.x == msg.move.x && game.lastMove.y == msg.move.y)
					return;
				console.log("Msg");
				console.log(msg);
				console.log(game.lastMove);
				board[msg.move.x][msg.move.y].square = msg.move.value;
				game.lastMove = msg.move;
				game.playerTurn = true;
				game.turn++;
				this.checkGameOver(board,socket);
			},
			reset:function(board){
				for(var y=0; y<3; y++){
						for(var x=0; x<3; x++){
							board[y][x].square = "";
						}
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
			move:{},
			init:function(controller){
				console.log("Init board");
				var array = new Array(3);
				array[0] =  {status:"off",index:0,card:"R"};
				array[1] =  {status:"off",index:1,card:"P"};
				array[2] =  {status:"off",index:2,card:"S"};
				controller.view = array;
				game.playerTurn = true;
			},
			play:function(board,move,socket){
				if(!game.playerTurn)
					return
				console.log(move);
				if(move.card !== "R" && move.card !== "P" && move.card !== "S")
					return
				board[move.index].status = "you";
				console.log(board);
				this.bothPlayersPicked++;
				game.playerTurn = false;
				this.move = move;
				this.sendMove(move,settings.boardId,settings.playerId,socket);
			},
			sendMove:function(move,boardId,playerId,socket){
				var msg = {move:move,playerId:playerId,boardId:boardId,wait:2};
				socket.emit("wait",msg);
			},
			compare:function(board,socket,msg){
				if(this.move.card == msg.move.card)
					return "draw";
				var status = "lost";
				switch(this.move.card){
					case 'R':
						if(msg.move.card === "S"){
							status = "win"
						}
						break;
					case 'P':
						if(msg.move.card === "R"){
							status= "win";
						}
						break
					case 'S':
						if(msg.move.card === "P"){
							status = "win";
						}
						break;
				}
				alert("You " + status );
				socket.emit("end",{playerId:settings.playerId,boardId:settings.boardId});
				var rps = this;
				socket.on("reset",function(msg){
					rps.reset(board);
				});
			},
			update:function(board,socket,msg){
				var history = msg.board;
				var opponent;
				for(var i=0; i<2; i++){
					if(history[i].playerId !== settings.playerId){
						opponent=history[i];
						board[opponent.move.index].status = "opponent";
						break;
					}
				}
				this.compare(board,socket,opponent);
			},
			reset:function(board){
				game.playerTurn = true;
				this.move = {};
				board[0].status = "off";
				board[1].status = "off";
				board[2].status = "off";
			}
		};
	});
	
	app.controller("StartController",
	function(socket,$interval){
		game.started = false;
		this.msg = "Welcome to TicTacToe/RockPaperScissors Online";
		var controller =  this;
		var lockout = false;
		var leaveSet = false;
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
			if(leaveSet)
				return;
			leaveSet = true;
		window.addEventListener("beforeunload", function(e){
				lockout = true;
				socket.emit("leave",{playerId:settings.playerId,boardId:settings.boardId});
				var message = "Removing you from queue/game";
    			e.returnValue = message;
				return message;
		}, false);
		}
		if(settings.boardId !== ""){
			console.log("board id");
			console.log(settings.boardId);
			setLeave();
		}
	});
	
	app.controller("GameController",
		function(socket,tictactoe,rps){
			var controller=  this;
			this.currentGame = game.list[RPS];
			this.games = [tictactoe,rps];
			this.gameModule = this.games[this.currentGame];
			this.getView = function(){
				return this.view;
			}
			this.turn = function(){
				if(game.playerTurn)
					return "your turn.";
				return "your opponent's turn.";
			}
			this.play = function(move){
				console.log("this triggered");
				this.gameModule.play(this.view,move,socket);
			}
			
			// Play when both sent moves.
			socket.on('end wait',function(msg){
				console.log("Recieved end wait");
				console.log(msg);
				controller.gameModule.update(controller.view,socket,msg);
			});
		
			// Update when both send moves.
			socket.on('update',function(msg){
				console.log("Received a update");
				console.log(msg);
				if(msg == null)
					return;
				controller.gameModule.update(controller.view,socket,msg);
			});
			socket.on('leave',function(msg){
				alert("A player has left the game");
				console.log("Resetting the board");
				controller.gameModule.reset(controller.view);
				game.playerTurn = false;
				game.started = false;
			});
			
			this.gameModule.init(this,socket);
			if(settings.boardId !== ""){
				socket.emit("update",{boardId:settings.boardId,playerId:settings.playerId});
			}
		}
	);
})();



