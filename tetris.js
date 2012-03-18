function TetrisGame(id, linesId) {
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
		1: [[0,-1], [0,0], [0,1], [0,2]],
		2: [[0,-1], [0,0], [0,1], [1,1]],
		3: [[0,-1], [0,0], [0,1], [-1,1]],
		4: [[0,0], [0,1], [1,0], [1,1]],
		5: [[-1,0], [0,0], [0,1], [1,1]],
		6: [[0,-1], [0,0], [-1,0], [1,0]],
		7: [[1,0], [0,0], [0,1], [-1,1]],
	}

	/**************/
	/* Variables: */
	/**************/
	this.gameIsOver = false;
	this.linesCleared = 0;
	
	this.width = 10;
	this.height = 15;
	this.canvas = new TetrisCanvas(id, this.width, this.height, linesId);
	this.board = createArray(this.width, this.height);
	
	this.currentBrickId = 0;
	this.currentBrickLoc = [-1, -1];
	this.currentBrickRot = 0;
	
	/**************/
	/* Functions: */
	/**************/
	this.drawLocker = false;
	this.drawLock = function() { this.drawLocker = true; };
	this.drawUnlock = function() { this.drawLocker = false; };

	this.redraw = function() {
		if (this.drawLocker) {
			return;
		}

		this.canvas.drawBoard(this.board);
		this.drawCurrentBrick();
	}
	
	this.xyToTileIndex = function(x,y) {
		return y * this.width + x;
	}
	
	this.tileIndexToXY = function(tileIndex) {
		var y = Math.floor(tileIndex / this.width);
		var x = tileIndex % y;
		
		return [x,y];
	}
	
	this.getRandomBrick = function() {
		return 1 + Math.floor(Math.random() * 7);
	}

	this.getBrickStartingLocation = function(brickId) {
		var shape = this.brickShape(this.currentBrickId, this.currentBrickRot);
		var lowestPoint = 0;

		for (var i = 0; i < 4; i++) {
			lowestPoint = Math.min(lowestPoint, shape[i][1]);
		}

		return [Math.floor(this.width/2),this.height-lowestPoint-1];
	}
	
	this.resetCurrentBrick = function() {
		if (! this.gameIsOver) {
			this.currentBrickId = this.getRandomBrick();
			this.currentBrickRot = 0;
			this.currentBrickLoc = this.getBrickStartingLocation(this.currentBrickId);
	
			this.redraw();
		}
	}
	
	this.brickShape = function(brickId, brickRot) {
		var glob_shape = this.brickShapes[brickId];
		var shape = createArray(4,2);
		
		for (var i = 0; i < 4; i++) {
			switch(brickRot) {
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
		
		return shape;
	}
	
	this.drawCurrentBrick = function() {
		var shape = this.brickShape(this.currentBrickId, this.currentBrickRot);
		
		for (var i = 0; i < 4; i++) {
			var x = this.currentBrickLoc[0]+shape[i][0];
			var y = this.currentBrickLoc[1]+shape[i][1];
			this.canvas.drawRectangle(x, y, this.bricks[this.currentBrickId]);
		}
	}

	this.isValidBrickLoc = function(brickId, brickLoc, brickRot) {
		var shape = this.brickShape(brickId, brickRot);
		
		for (var i = 0; i < 4; i++) {
			var x = brickLoc[0] + shape[i][0];
			var y = brickLoc[1] + shape[i][1];
			
			if (x < 0 || x >= this.width) { return false; }
			if (y < 0) { return false; }
			if (y >= this.height) { continue; }
			
			if (this.board[x][y] != 0) {
				return false;
			}
		}
		
		return true;

	}
	
	this.canCurrentBrickMove = function(dx,dy) {
		var newLoc = createArray(2);
		newLoc[0] = this.currentBrickLoc[0] + dx;
		newLoc[1] = this.currentBrickLoc[1] + dy;

		return this.isValidBrickLoc(
				this.currentBrickId,
				newLoc,
				this.currentBrickRot
			);
	}
	
	this.canCurrentBrickRotate = function() {
		return this.isValidBrickLoc(
				this.currentBrickId,
				this.currentBrickLoc,
				(this.currentBrickRot + 1) % 4
			);
	}
	
	this.moveCurrentBrickHorizontally = function(dx) {
		if (this.canCurrentBrickMove(dx, 0)) {
			this.currentBrickLoc[0] += dx;
			this.redraw();
			return true;
		}
		return false;
	}

	this.moveCurrentBrickDown = function() {
		if (this.canCurrentBrickMove(0, -1)) {
			this.currentBrickLoc[1] -= 1;
			this.redraw();
			return true;
		}
		
		// If not, integrate into board:
		var shape = this.brickShape(this.currentBrickId, this.currentBrickRot);
		for (var i = 0; i < 4; i++) {
			var x = this.currentBrickLoc[0]+shape[i][0];
			var y = this.currentBrickLoc[1]+shape[i][1];

			if (y >= this.height) {
				this.gameIsOver = true;
				return false;
			}

			this.board[x][y] = this.bricks[this.currentBrickId];
		}
		
		this.resetCurrentBrick();
		return true;
	}

	this.hardDrop = function() {	
		while (this.canCurrentBrickMove(0,-1)) {
			this.moveCurrentBrickDown();
		}
		return this.moveCurrentBrickDown();		
	}
	
	this.rotateCurrentBrick = function() {
		if (this.canCurrentBrickRotate()) {
			this.currentBrickRot = (this.currentBrickRot + 1) % 4;
			this.redraw();
			return true;
		}
		return false;
	}

	this.getFilledLines = function() {
		var lines = [];

		for (var y = 0; y < this.height; y++) {
			var isLineFilled = true;

			for (var x = 0; x < this.width; x++) {
				if (this.board[x][y] == 0) {
					isLineFilled = false;		
				}
			}

			if (isLineFilled) {
				lines.push(y);
			}
		}
		return lines;
	}

	this.removeLine = function(linenr) {
		if (linenr == undefined) {
			return;
		}

		for (var y = parseInt(linenr); y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				if (y+1 >= this.height) {
					this.board[x][y] = 0;
				} else {
					this.board[x][y] = this.board[x][y+1];
				}
			}
		}
	}	
	
	this.doTurn = function() {
		this.drawLock();
		if (! this.moveCurrentBrickDown()) {
			this.drawUnlock();
			return false;
		}

		var filledLines = this.getFilledLines();
		for (var i = 0; i < filledLines.length; i++) {
			this.removeLine(filledLines[i]-i);
		}

		this.linesCleared += filledLines.length;
		this.canvas.updateLines(this.linesCleared);

		this.drawUnlock();
		this.redraw();

		return true;
	}

	this.loop = function(game) {
		if (! game.doTurn()) {
			return false;
		}
			
		window.setTimeout(game.loop, 333, game);
		
	}

	this.startGame = function() {
		this.loop(this);
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
		
		this.resetCurrentBrick();
	};
	this.TetrisGame(id);
}
