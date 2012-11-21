function TetrisGame(canvasId, linesCounterId, nextBricksCanvasId) {
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

	this.stats = new TetrisStats();
	
	this.width = 10;
	this.canvas = new TetrisCanvas(canvasId, this.width); 
	this.height = this.canvas.sHeight;


	this.lineCounterElement = 0;
	this.nextBricksCanvas = nextBricksCanvasId ? new TetrisCanvas(nextBricksCanvasId, 5, 25) : null;
	this.board = createArray(this.width, this.height);
	
	this.currentBrickId = 0;
	this.currentBrickLoc = [-1, -1];
	this.currentBrickRot = 0;

	this.nextBrickArray = Array(5);
	this.nextBrickArrayIndex = 0;
	
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
		this.redrawNextBrickCanvas();
	}
	
	this.redrawNextBrickCanvas = function() {
		if (this.nextBricksCanvas != null) {
			for (var x = 0; x < this.nextBricksCanvas.sWidth; x++) {
				for (var y = 0; y < this.nextBricksCanvas.sHeight; y++) {
					this.nextBricksCanvas.drawRectangle(x,y,0);
				}
			}


			for (var counter = 0; counter < this.nextBrickArray.length; counter++) {
				var nextBrickId = this.nextBrickArray[(this.nextBrickArrayIndex + counter) % this.nextBrickArray.length];
				
				var shape = this.brickShape(nextBrickId, 0);
				for (var i = 0; i < 4; i++) {
					var x = 2 + shape[i][0];
					var y = this.nextBricksCanvas.sHeight - (counter * 5 + 3 - shape[i][1]);

					this.nextBricksCanvas.drawRectangle(x,y,this.bricks[nextBrickId]);
				}
			}	
		}
	}
	
	this.xyToTileIndex = function(x,y) {
		return y * this.width + x;
	}
	
	this.tileIndexToXY = function(tileIndex) {
		var y = Math.floor(tileIndex / this.width);
		var x = tileIndex % y;
		
		return [x,y];
	}
	
	this.getBrickStartingLocation = function(brickId) {
		var shape = this.brickShape(this.currentBrickId, this.currentBrickRot);
		var lowestPoint = 0;

		for (var i = 0; i < 4; i++) {
			lowestPoint = Math.min(lowestPoint, shape[i][1]);
		}

		return [Math.floor(this.width/2),this.height-lowestPoint-1];
	}
	
	this.getRandomBrick = function() {
		return 1 + Math.floor(Math.random() * 7);
	}

	this.getNextBrick = function() {
		var brick = this.nextBrickArray[this.nextBrickArrayIndex];
		
		this.nextBrickArray[this.nextBrickArrayIndex] = this.getRandomBrick();
		this.nextBrickArrayIndex = (this.nextBrickArrayIndex + 1) % 5;

		return brick;
	}

	this.getNextCurrentBrick = function() {
		if (! this.gameIsOver) {
			this.currentBrickId = this.getNextBrick();
			this.currentBrickRot = 0;
			this.currentBrickLoc = this.getBrickStartingLocation(this.currentBrickId);
	
			this.stats.newBrick(this.currentBrickId);
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

	this.integrateCurrentIntoBoard = function () {
		if (this.currentBrickId == 0) {
			return true;
		}

		var shape = this.brickShape(this.currentBrickId, this.currentBrickRot);
		for (var i = 0; i < 4; i++) {
			var x = this.currentBrickLoc[0]+shape[i][0];
			var y = this.currentBrickLoc[1]+shape[i][1];

			if (y >= this.height) {
				this.gameIsOver = true;
				return false;
			}

			this.board[x][y] = this.bricks[this.currentBrickId];
			this.currentBrickId = 0;
			this.currentBrickLoc = 0;
			this.currentBrickRot = 0;
		}

	}

	this.moveCurrentBrickDown = function() {
		if (this.canCurrentBrickMove(0, -1)) {
			this.currentBrickLoc[1] -= 1;
			this.redraw();
			return true;
		}
		
		// If it can't move, trye to integrate it into board:
		if (this.integrateCurrentIntoBoard() == false) {
			return false;
		}
		
		this.currentBrickId = 0;
		this.currentBrickLoc = 0;
		this.currentBrickRot = 0;
		return true;
	}

	this.hardDrop = function() {	
		while (this.canCurrentBrickMove(0,-1)) {
			this.moveCurrentBrickDown();
		}
		return this.integrateCurrentIntoBoard();		
	}
	
	this.rotateCurrentBrick = function() {
		if (this.canCurrentBrickRotate()) {
			this.currentBrickRot = (this.currentBrickRot + 1) % 4;
			this.redraw();
			return true;
		}
		return false;
	}

	this.getFilledLines = function(b) {
		if (typeof(b) === 'undefined') b = this.board;

		var lines = [];

		for (var y = 0; y < b[0].length; y++) {
			var isLineFilled = true;

			for (var x = 0; x < b.length; x++) {
				if (b[x][y] == 0) {
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

	this.updateLineCounter = function() {
		if (this.lineCounterElement != 0) {
			this.lineCounterElement.html('' +this.stats.countLinesCleared);
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

		this.stats.linesCleared(filledLines.length);
		this.updateLineCounter();


		if (this.currentBrickId == 0) {
			this.getNextCurrentBrick();
		}

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
	this.TetrisGame = function() {
		// Find the line counter element if defined:
		this.lineCounterElement = $('#' +linesCounterId);

		// Initialize the board:
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				this.board[x][y] = 0;
			}
		}

		// Initialize the next-brick array:
		for (var i = 0; i < this.nextBrickArray.length; i++) {
			this.nextBrickArray[i] = this.getRandomBrick();
		}
		
		this.getNextCurrentBrick();
	};
	this.TetrisGame();
}
