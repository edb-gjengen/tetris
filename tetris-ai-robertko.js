var ACTION_NOTHING = 0;
var ACTION_LEFT = 1;
var ACTION_RIGHT = 2;
var ACTION_ROTATE = 3;
var ACTION_DROP = 4;

var game;
var version = "0.4";

var mod_rank_height_mul   = 0.5;
var mod_rank_hole_malus   = 16;
var mod_rank_hole_mult    = 1.25;
var mod_rank_hole_decay   = 0.8;
var mod_rank_line_clear   = 5;
var mod_rank_shaft        = 5;
var mod_rank_shaft_deep   = 2.5;
var mod_rank_shaft_ibonus = 0;
var mod_rank_horizontal   = 1.5;

var bestDropLocation = null;
 
function getAllPossibleDropLocations(brickId, brickLoc, brickRot, board) {
	var dropLocations = [];

	// Go as far down as possible:
	var goDown = function(x, y, rot) {
		var counter = 0;
		while (game.isValidBrickLoc(brickId, [x, y - counter], rot, board)) {
			counter++;
		}
		
		if (game.isValidBrickLoc(brickId, [x, y - counter + 1], rot, board)) {
			dropLocations.push([x,y - counter + 1, rot]);
		}
	}

	// For each of the four rotations:
	for (var i = 0; i < 4; i++) {
		var x = brickLoc[0];
		var y = brickLoc[1];

		// Try to go as far left as possible:
		var counter = 0;
		while (game.isValidBrickLoc(brickId, [x - counter, y], i, board)) {
			goDown(x - counter, y, i);
			counter++;
		}

		// Try to go as far right as possible:
		var counter = 1;
		while (game.isValidBrickLoc(brickId, [x + counter, y], i, board)) {
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

function rankHeight(brickId, dropLocation, board) {
	var shape = game.brickShape(brickId, dropLocation[2]);
	
	// find the brick points:
	var lowest = shape[0][1] + dropLocation[1];
	var highest = shape[0][1] + dropLocation[1];
	var sum = shape[0][1] + dropLocation[1];
	
	for (var i = 1; i < 4; i++) {
		lowest = Math.min(lowest, shape[i][1]+dropLocation[1]);
		highest = Math.max(highest, shape[i][1]+dropLocation[1]);
		sum += shape[i][1] + dropLocation[1];
	}
	
	// if highest is invalid, then return a very low rank:
	if (highest >= game.height)   return -100000;
	if (highest >= game.height-2) return -10000;
	//if (highest >= game.height-4) return -500;
	

	/*var old_highest = -1;

	// find the last highest point on board:
	for (var y = game.height-1; y > 0 && old_highest < 0; y--) {
		for (var x = 0; x < game.width && old_highest < 0; x++) {
			if (board[x][y] != 0) {
				old_highest = y;
			}
		}
	}*/

	//return - Math.pow(highest/game.height, 2) * highest - mod_rank_height_mul * Math.max(0, highest - old_highest);
	return - highest * mod_rank_hole_mult;

}

function rankAmountHoles(board) {	
	var totalRankBonus = 0;	
	for (var x = 0; x < game.width; x++) {	
		var currentMalus = mod_rank_hole_malus;

		// for each row check how many empty tiles there are right under:
		var isStarted   = false;
		var y = game.height - 1;

		while (y >= 0) {
			if (isStarted) {
				if (board[x][y] == 0) {
					totalRankBonus -= currentMalus;
					currentMalus *= mod_rank_hole_mult;
				} else {
					currentMalus *= mod_rank_hole_decay;
				}
			} else if (board[x][y] != 0) {
				if (y > 0 && board[x][y-1] == 0) {
					isStarted = true;
				} else {
					currentMalus *= mod_rank_hole_mult;
				}
			}

			y--;
		}
	}
	return totalRankBonus;
}

function rankClearedRows(linesCleared) {
	return linesCleared * mod_rank_line_clear;
}

function rankShafts(brickId, dropLocation, tempBoard) {
	var rank = 0;

	for (var i = 0; i < game.nextBrickArray.length; i++) {
		if (game.nextBrickArray[i] == 1) { // If there's an 'I' nearby...
			return mod_rank_shaft_ibonus;
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
			rank -= mod_rank_shaft * Math.pow(mod_rank_shaft_deep, shaftTiles-3);
		}
	}
	
	return rank;
}

function rankHorizontal(board) {
	totalRank = 0;

	for (var y = 0; y < game.height; y++) {
		for (var x = 1; x < game.width; x++) {
			var bleft = board[x-1][y] != 0;
			var bright = board[x][y] != 0;

			if (bleft != bright) {
				totalRank -= mod_rank_horizontal;
			} else {
				totalRank += mod_rank_horizontal;
			}
		}
	}

	return totalRank;
}

function chooseBestRank(brickId, board, dropLocations, level) {
	if (typeof(level) === 'undefined') level = 0;

	var bestRank = 0;
	var bestId = -1;
	var bestBoard = null;

	for (var i = 0; i < dropLocations.length; i++) {
		var tempBoard = $.extend(true, [], board);
		var shape = game.brickShape(brickId, dropLocations[i][2]);
	
		// prepare tempBoard:
		for (var j = 0; j < shape.length; j++) {
			var x = dropLocations[i][0]+shape[j][0];
			var y = dropLocations[i][1]+shape[j][1];
	
			tempBoard[x][y] = game.bricks[brickId];
		}
	
		var filledLines = game.getFilledLines(tempBoard);
		for (var j = 0; j < filledLines.length; j++) {
			game.removeLine(tempBoard, filledLines[j]-j);
		}
		var linesCleared = filledLines.length;

		// rank!
		var rank = 0;

		rank += rankHeight(brickId, dropLocations[i], game.board);
		rank += rankAmountHoles(tempBoard);
		rank += rankClearedRows(linesCleared);
		rank += rankShafts(brickId, dropLocations[i], tempBoard);
		rank += rankHorizontal(tempBoard);


		if (level < 1) {
			nextBrickId = game.peekNextBrick();
			nextLevelDropLocations = getAllPossibleDropLocations(nextBrickId, game.getBrickStartingLocation(nextBrickId), 0, tempBoard);
			nextRank = chooseBestRank(nextBrickId, tempBoard, nextLevelDropLocations, level + 1);
			rank += nextRank[1];
		}
	
		/* Check if the rank is better than current best: */
		if (bestId == -1 || rank > bestRank) {
			bestId = i;
			bestRank = rank;
			bestBoard = tempBoard;
		}	
	}

	return [ bestId, bestRank ];
}

function chooseDropLocation(brickId, brickLoc, brickRot, board) {
	if (bestDropLocation !== null) return bestDropLocation;

	var dropLocations = getAllPossibleDropLocations(brickId, brickLoc, brickRot, board);
	if (dropLocations.length == 0) {
		return null;
	}

	var best = chooseBestRank(brickId, board, dropLocations);
	var bestId = best[0];
	var bestRank = best[1];

	bestDropLocation = dropLocations[bestId];
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

	if (action[0] == ACTION_ROTATE) {
		game.rotateCurrentBrick();
	} else if (action[0] == ACTION_LEFT) {
		game.moveCurrentBrickHorizontally(-1);
	} else if (action[0] == ACTION_RIGHT) {
		game.moveCurrentBrickHorizontally(1);
	} else if (action[0] == ACTION_DROP) {
		game.hardDrop();
		bestDropLocation = null;
	} else if (action[0] == ACTION_NOTHING) {
		/* Do nothing. D'uh. */
	}
}

function startAI() {
	var dropLocation = chooseDropLocation(game.currentBrickId, game.currentBrickLoc, game.currentBrickRot, game.board);
	var action = chooseAction(dropLocation);
	doAction(action);
	
	if (!game.gameIsOver) {
		window.setTimeout(startAI, 10);
	} else {
		$.post(
			"http://paalbra.at.neuf.no/tetris/highscore.php",
	   		{ score : game.stats.countLinesCleared, name : 'robertko_' + version},
   			function(data) {
				console.info(data);
			}
		).error(function(data) {
			console.warn(data);		
		});

		window.setTimeout("location.reload()", 3000);
	}
}

function refreshWindow() {

}

$(document).ready(function() {
	game = new TetrisGame("tetris-board", "lines", "next-bricks");
	game.startGame();
	startAI();
});
