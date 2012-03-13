var game = null;

function doTurn() {
	game.doTurn();
	window.setTimeout(doTurn, 333);
}

$(document).ready(function() {
	game = new TetrisGame("tetris-board");
	doTurn();
});