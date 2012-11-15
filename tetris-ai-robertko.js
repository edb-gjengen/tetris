var ACTION_NOTHING = 0;
var ACTION_LEFT = 1;
var ACTION_RIGHT = 2;
var ACTION_ROTATE = 3;
var ACTION_DROP = 4;

var game;

var mod_rank_hole_malus = 10;
var mod_rank_hole_mult  = 1.4;
var mod_rank_hole_decay = 0.1;
var mod_rank_hole_min   = -20;
var mod_rank_line_clear = 10;
var mod_rank_shaft      = 3;
var mod_rank_shaft_deep = 2.0;

function getAllPossibleDropLocations(brickId) {
	var dropLocations = [];

	// Go as far down as possible:
	var goDown = function(x, y, rot) {
		var counter = 0;
		while (game.isValidBrickLoc(brickId, [x, y - counter], rot)) {
			counter++;
		}
		
		if (game.isValidBrickLoc(brickId, [x, y - counter + 1], rot)) {
			dropLocations.push([x,y - counter + 1, rot]);
		}
	}

	// For each of the four rotations:
	for (var i = 0; i < 4; i++) {
		var x = game.currentBrickLoc[0];
		var y = game.currentBrickLoc[1];

		// Try to go as far left as possible:
		var counter = 0;
		while (game.isValidBrickLoc(brickId, [x - counter, y], i)) {
			goDown(x - counter, y, i);
			counter++;
		}

		// Try to go as far right as possible:
		var counter = 1;
		while (game.isValidBrickLoc(brickId, [x + counter, y], i)) {
			goDown(x + counter, y, i);
			counter++;
		}
	}

	return dropLocations;
}

function getBoundsOfABrick(brickId, brickLoc, brickRot) {
	var shape = game.brickShape(brickId, brickRot);

	var leftTop = shape[0].slice(0);
	var rightTop = shape[0].slice(0);

	for (var i = 1; i < shape.length; i++) {
		var tile = shape[i];

		if (tile[0] < leftTop[0] || (tile[0] == leftTop[0] && tile[1] > leftTop[1])) {
			leftTop = tile.slice(0);
		}
		
		if (tile[0] > rightTop[0] || (tile[0] == rightTop[0] && tile[1] > rightTop[1])) {
			rightTop = tile.slice(0);
		}
	}

	leftTop[0] += brickLoc[0];
	leftTop[1] += brickLoc[1];
	rightTop[0] += brickLoc[0];
	rightTop[1] += brickLoc[1];
	
	return [leftTop, rightTop];
}

function getLowestTiles(brickId, brickLoc, brickRot) {
	var shape = game.brickShape(brickId, brickRot);
	var bounds = getBoundsOfABrick(brickId, brickLoc, brickRot);
	var width = bounds[1][0] - bounds[0][0] + 1;
	var lowestTiles = Array(width);
	
	for (var i = 0; i < width; i++) {
		lowestTiles[i] = game.height;
	}
	
	for (var i = 0; i < 4; i++) {
		var x = shape[i][0] + brickLoc[0] - bounds[0][0];
		var y = shape[i][1] + brickLoc[1];
		
		lowestTiles[x] = Math.min(lowestTiles[x], y);
	}
	
	return lowestTiles;
}

function rankHeight(brickId, dropLocation, tempBoard) {
	var shape = game.brickShape(brickId, dropLocation[2]);
	
	// find the lowest point:
	var lowest = shape[0][1] + dropLocation[1];
	var highest = shape[0][1] + dropLocation[1];
	var sum = shape[0][1] + dropLocation[1];
	
	for (var i = 1; i < 4; i++) {
		lowest = Math.min(lowest, shape[i][1]+dropLocation[1]);
		highest = Math.max(highest, shape[i][1]+dropLocation[1]);
		sum += shape[i][1] + dropLocation[1];
	}
	
	// if highest is invalid, then return a very low rank:
	if (highest >= game.height) {
		return -100000;
	}

	//return -(Math.pow(lowest, 2) / game.height);
	//return -(Math.pow(highest, 2) / game.height);
	return -(Math.pow(sum/4.0, 2) / game.height);
	//return -sum;

}

function rankAmountHoles(brickId, dropLocation, tempBoard) {	
	var bounds = getBoundsOfABrick(brickId, [dropLocation[0], dropLocation[1]], dropLocation[2]);
	var lowestTiles = getLowestTiles(brickId, [dropLocation[0], dropLocation[1]], dropLocation[2]);

	var totalRankBonus = 0;	
	for (var i = 0; i < lowestTiles.length; i++) {	
		var currentMalus = mod_rank_hole_malus;

		// for each row check how many empty tiles there are right under:
		var x = bounds[0][0] + i;
		var y = lowestTiles[i] - 1;
		while (y >= 0) {
			if (game.board[x][y] == 0) {
				totalRankBonus -= currentMalus;
				currentMalus *= mod_rank_hole_mult;
			} else {
				currentMalus *= mod_rank_hole_decay;
			}
			y--;
		}
	}
	
	return totalRankBonus > mod_rank_hole_min ? totalRankBonus : mod_rank_hole_min;
}

function rankClearedRows(brickId, dropLocation, tempBoard) {
	var linesCleared = game.getFilledLines(tempBoard).length;
	return linesCleared * mod_rank_line_clear;
}

function rankShafts(brickId, dropLocation, tempBoard) {
	var rank = 0;

	for (var i = 0; i < game.nextBrickArray.length; i++) {
		if (game.nextBrickArray[i] == 1) { // If there's an 'I' nearby...
			return rank;
		}
	}


	for (var x = 0; x < game.width; x++) {
		var shaftTiles = 0;
		for (var y = game.height - 1; y >= 0; y--) {
			if (tempBoard[x][y] != 0) {
				break;
			}

			if (shaftTiles > 0) {
				shaftTiles++;
				continue;
			}

			if ((x-1 < 0 || tempBoard[x-1][y] != 0) && (x+1 >= game.width || tempBoard[x+1][y] != 0)) {
				shaftTiles++;
				continue;
			}
		}

		if (shaftTiles >= 2) {
			rank -= mod_rank_shaft * Math.pow(1.8, shaftTiles-3);
		}
	}
	
	return rank;
}

function chooseDropLocation(brickId) {
	var dropLocations = getAllPossibleDropLocations(brickId);
	
	if (dropLocations.length == 0) {
		return null;
	}

	var bestRank = 0;
	var bestId = -1;

	for (var i = 0; i < dropLocations.length; i++) {
		var tempBoard = $.extend(true, [], game.board);
		var shape = game.brickShape(brickId, dropLocations[i][2]);
	
		for (var j = 0; j < shape.length; j++) {
			var x = dropLocations[i][0]+shape[j][0];
			var y = dropLocations[i][1]+shape[j][1];
	
			tempBoard[x][y] = game.bricks[brickId];
		}
	
		var rank = 0;

		rank += rankHeight(brickId, dropLocations[i], tempBoard);
		rank += rankAmountHoles(brickId, dropLocations[i], tempBoard);
		rank += rankClearedRows(brickId, dropLocations[i], tempBoard);
		rank += rankShafts(brickId, dropLocations[i], tempBoard);

		/* Check if the rank is better than current best: */
		if (bestId == -1 || rank > bestRank) {
			bestId = i;
			bestRank = rank;
		}
	}

	return dropLocations[bestId];
}

function chooseAction(dropLocation) {
	if (dropLocation == null) {
		return [ACTION_NOTHING, 0];
	}

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
	} else if (action[0] == ACTION_NOTHING) {
		/* Do nothing. D'uh. */
	}
}

function startAI() {
	var dropLocation = chooseDropLocation(game.currentBrickId);
	var action = chooseAction(dropLocation);
	doAction(action);
	
	if (!game.gameIsOver) {
		window.setTimeout(startAI, 5);
	}
}

$(document).ready(function() {
	game = new TetrisGame("tetris-board", "lines", "next-bricks");
	game.startGame();
	startAI();
});
