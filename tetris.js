function TetrisGame(id) {
	/*********/
	/* Enum: */
	/*********/
	this.bricks = {
		0:   0,
		1: 'I',
		2: 'J',
		3: 'L',
		4: 'O',
		5: 'S',
		6: 'T',
		7: 'Z',
	};
	
	this.brickShapes = {
		0: [[0,0], [0,0], [0,0], [0,0]],
		1: [[0,0], [0,1], [0,2], [0,3]],
		2: [[0,0], [0,1], [0,2], [1,2]],
		3: [[0,0], [0,1], [0,2], [-1,2]],
		4: [[0,0], [0,1], [1,0], [1,1]],
		5: [[0,0], [1,0], [1,1], [2,1]],
		6: [[0,0], [0,1], [-1,1], [1,1]],
		7: [[0,0], [-1,0], [-1,1], [-2,1]],
	}

	/**************/
	/* Variables: */
	/**************/
	this.width = 10;
	this.height = 15;
	this.canvas = new TetrisCanvas(id, this.width, this.height);
	this.board = createArray(this.width, this.height);
	
	this.currentBrickId = 0;
	this.currentBrickLoc = [-1, -1];
	this.currentBrickRot = 0;
	
	/**************/
	/* Functions: */
	/**************/
	this.getRandomBrick = function() {
		return Math.floor(Math.random() * 8);
	}
	
	this.drawCurrentBrick = function() {
		var glob_shape = this.brickShapes[this.currentBrickId];
		var shape = createArray(4,2);
		
		for (var i = 0; i < 4; i++) {
			switch(this.currentBrickRot) {
				case 0:
					shape[i][0] = glob_shape[i][0];
					shape[i][1] = glob_shape[i][1];
					break;
				case 1:
					shape[i][0] = glob_shape[i][1];
					shape[i][1] = -glob_shape[i][0];
					break;
				case 2:
					shape[i][0] = -glob_shape[i][0];
					shape[i][1] = -glob_shape[i][1];
					break;
				case 3:
					shape[i][0] = -glob_shape[i][1];
					shape[i][1] = glob_shape[i][0];
					break;
			}
		}
		
		for (var i = 0; i < 4; i++) {
			var x = this.currentBrickLoc[0]+shape[i][0];
			var y = this.currentBrickLoc[1]+shape[i][1];
			this.canvas.drawRectangle(x, y, this.bricks[this.currentBrickId]);
		}
	}
	
	this.doTurn = function() {
		/* Fill out */
		this.currentBrickId = 3;
		this.currentBrickLoc = [5,5];
		this.currentBrickRot = 1;
	
		this.canvas.drawBoard(this.board);
		this.drawCurrentBrick();
	}

	/****************/
	/* Constructor: */
	/****************/
	this.TetrisGame = function(id) {
		for (var y = 0; y < 15; y++) {
			for (var x = 0; x < 10; x++) {
				this.board[x][y] = 0;
			}
		}
	};
	this.TetrisGame(id);
}

$(document).ready(function() {
	var tetris = new TetrisGame("tetris-board");
	tetris.doTurn();
});