var ACTION_LEFT = 1;
var ACTION_RIGHT = 2;
var ACTION_ROTATE = 3;
var ACTION_DROP = 4;

var game;

function getAllPossibleDropLocations(brickId) {
	var dropLocations = [];

	// Go as far down as possible:
	var goDown = function(x, y, rot) {
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
		while(game.isValidBrickLoc(brickId, [game.currentBrickLoc[0]-counter,game.currentBrickLoc[1], i], i)) {
			goDown(game.currentBrickLoc[0]-counter, game.currentBrickLoc[1], i);
			counter++;
		}

		// Try to go as far right as possible:
		var counter = 0;
		do {
			goDown(game.currentBrickLoc[0]+counter, game.currentBrickLoc[1], i);
			counter++;
		} while(game.isValidBrickLoc(brickId, [game.currentBrickLoc[0]+counter,game.currentBrickLoc[1], i], i));
	}

	return dropLocations;
}

function getBoundsOfABrick(brickId, brickLoc, brickRot) {
	var shape = game.brickShape(brickId, brickRot);

	var leftTop = shape[0];
	var rightTop = shape[0];

	for (var i = 1; i < shape.length; i++) {
		var tile = shape[i];

		if (tile[0] < leftTop[0] || tile[1] > leftTop[1]) {
			leftTop = tile;
		}
		
		if (tile[0] > rightTop[0] || tile[1] > rightTop[1]) {
			rightTop = tile;
		}
	}

	leftTop[0] += brickLoc[0];
	leftTop[1] += brickLoc[1];
	rightTop[0] += brickLoc[0];
	rightTop[1] += brickLoc[1];

	return [leftTop, rightTop];
}

function rankHeight(brickId, dropLocation) {
	var shape = game.brickShape(brickId, dropLocation[2]);
	
	// find the lowest point:
	var lowest = shape[0][1] + dropLocation[1];
	var highest = shape[0][1] + dropLocation[1];
	
	for (var i = 1; i < 4; i++) {
		lowest = Math.min(lowest, shape[i][1]+dropLocation[1]);
		highest = Math.max(highest, shape[i][1]+dropLocation[1]);
	}
	
	// if highest is invalid, then return a very low rank:
	if (highest >= game.height) {
		return -1000;
	}
	
	return game.height - (Math.pow(lowest, 2) / game.height);
}

function chooseDropLocation(brickId) {
	var dropLocations = getAllPossibleDropLocations(brickId);

	var bestRank = 0;
	var bestId = -1;

	for (var i = 0; i < dropLocations.length; i++) {
		var rank = 0;

		rank += rankHeight(brickId, dropLocations[i]);
		
		/* Check if the rank is better than current best: */
		if (bestId == -1 || rank > bestRank) {
			bestId = i;
			bestRank = rank;
		}
	}

	return dropLocations[bestId];
}

function chooseAction(dropLocation) {
	var dx = dropLocation[0] - game.currentBrickLoc[0];
	var dy = dropLocation[1] - game.currentBrickLoc[1];
	var dr = (dropLocation[2] - game.currentBrickRot + 4) % 4;

	if (dr != 0) return [ACTION_ROTATE, dr];
	if (dx <  0) return [ACTION_LEFT, -dx];
	if (dx >  0) return [ACTION_RIGHT, dx];
	return [ACTION_DROP, -dy];
}

function doAction(action) {
	if (action[1] == 0) {
		return;
	}

	if (action[0] == ACTION_LEFT) {
		game.moveCurrentBrickHorizontally(-1);
	} else if (action[0] == ACTION_RIGHT) {
		game.moveCurrentBrickHorizontally(1);
	} else if (action[0] == ACTION_ROTATE) {
		game.rotateCurrentBrick();
	} else if (action[0] == ACTION_DROP) {
		game.hardDrop();	
		/* do nothing. */
	}
}

function startAI() {
	var dropLocation = chooseDropLocation(game.currentBrickId);
	var action = chooseAction(dropLocation);
	doAction(action);

	window.setTimeout(startAI, 50);
}

$(document).ready(function() {
	game = new TetrisGame("tetris-board");
	game.startGame();
	startAI();
});
