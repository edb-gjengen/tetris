var game = null;

function doTurn() {
	document.onkeypress = onKeyPressed;
	game.doTurn();
	window.setTimeout(doTurn, 333);
}

function onKeyPressed(e) {
	if (String.fromCharCode(e.charCode) == 'a') {
		game.moveCurrentBrickHorizontally(-1);
		return;
	}
	
	if (String.fromCharCode(e.charCode) == 'd') {
		game.moveCurrentBrickHorizontally(1);
		return;
	}
}

$(document).ready(function() {
	game = new TetrisGame("tetris-board");
	doTurn();
});