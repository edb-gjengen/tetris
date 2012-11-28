function test(elementId, randomseed) {
	if (typeof randomseed === 'undefined') randomseed = Math.floor(1337 * Math.random());

	var ACTION_LEFT = 1;
	var ACTION_RIGHT = 2;
	var ACTION_ROTATE = 3;
	var ACTION_DROP = 4;
	
	var game;
	
	this.getAllPossibleDropLocations = function(brickId) {
		var dropLocations = [[this.game.width/2,this.game.height+1,0]];
	
		// Go as far down as possible:
		var goDown = function(x, y, rot, game) {
			var counter = 0;
			while (game.isValidBrickLoc(brickId, [x, y - counter], rot)) {
				counter++;
			}
			dropLocations.push([x,y - counter+1,rot]);
		}
	
		// For each of the four rotations:
		for (var i = 0; i < 4; i++) {
			// Try to go as far left as possible:
			var counter = 0;
			while(this.game.isValidBrickLoc(brickId, [this.game.currentBrickLoc[0]-counter,this.game.currentBrickLoc[1], i], i)) {
				goDown(this.game.currentBrickLoc[0]-counter, this.game.currentBrickLoc[1], i, this.game);
				counter++;
			}
	
			// Try to go as far right as possible:
			var counter = 0;
			do {
				goDown(this.game.currentBrickLoc[0]+counter, this.game.currentBrickLoc[1], i, this.game);
				counter++;
			} while(this.game.isValidBrickLoc(brickId, [this.game.currentBrickLoc[0]+counter,this.game.currentBrickLoc[1], i], i));
		}
	
		return dropLocations;
	}
	
	this.chooseDropLocation = function(brickId) {
		var dropLocations = this.getAllPossibleDropLocations(brickId);
	
		/* Just find the lowest location possible: */
		var best = 0;
		for (var i = 0; i < dropLocations.length; i++) {
			if (dropLocations[i][1] < dropLocations[best][1]) {
				best = i;
			}
		}
	
		return dropLocations[best];
	}
	
	this.chooseAction = function(dropLocation) {
		var dx = dropLocation[0] - this.game.currentBrickLoc[0];
		var dy = dropLocation[1] - this.game.currentBrickLoc[1];
		var dr = (dropLocation[2] - this.game.currentBrickRot + 4) % 4;
	
		if (dr != 0) return [ACTION_ROTATE, dr];
		if (dx <  0) return [ACTION_LEFT, -dx];
		if (dx >  0) return [ACTION_RIGHT, dx];
		return [ACTION_DROP, -dy];
	}
	
	this.doAction = function(action) {
		if (action[1] == 0) {
			return;
		}
	
		if (action[0] == ACTION_LEFT) {
			this.game.moveCurrentBrickHorizontally(-1);
		} else if (action[0] == ACTION_RIGHT) {
			this.game.moveCurrentBrickHorizontally(1);
		} else if (action[0] == ACTION_ROTATE) {
			this.game.rotateCurrentBrick();
		} else if (action[0] == ACTION_DROP) {
			this.game.hardDrop();	
			/* do nothing. */
		}
	}
	
	this.startAI = function() {
		var dropLocation = this.chooseDropLocation(this.game.currentBrickId);
		var action = this.chooseAction(dropLocation);
		this.doAction(action);
		
		var pointer = this;	
		window.setTimeout(function() { pointer.startAI(); }, 50);
	}
	
	this.init = function() {
		this.game = new TetrisGame(elementId, undefined, undefined, randomseed);
		this.game.startGame();
		this.startAI();
	}

	this.init();
}
