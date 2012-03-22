var ACTION_LEFT = 1;
var ACTION_RIGHT = 2;
var ACTION_ROTATE = 3;
var ACTION_DROP = 4;

var game;

function getAllPossibleDropLocations(brickId) {
	var dropLocations = [[game.width/2,game.height+1,0]];

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

function chooseDropLocation(brickId) {
	var dropLocations = getAllPossibleDropLocations(brickId);

	/* Just find the lowest location possible: */
	var best = 0;
	for (var i = 0; i < dropLocations.length; i++) {
		if (dropLocations[i][1] < dropLocations[best][1]) {
			best = i;
		}
	}

	return dropLocations[best];
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
