var game = null;
var wasRecentlyRotated = false;

function initControls() {
	document.onkeypress = onKeyPressed;
	document.onkeydown = onKeyDown;
	document.onkeyup = onKeyUp;
}

function onKeyDown(e) {
	var ascii_space = 32;

	if (e.keyCode == ascii_space) {
		game.hardDrop();
	}
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
	
	if (String.fromCharCode(e.charCode) == 's') {
		game.moveCurrentBrickDown();
		return;
	}	

	if (String.fromCharCode(e.keyCode) == 'w') {
		if (! wasRecentlyRotated) {
			game.rotateCurrentBrick();
			wasRecentlyRotated = true;
		}
		return;
	}
}

function onKeyUp(e) {
	wasRecentlyRotated = false;
}

$(document).ready(function() {
	initControls();
	game = new TetrisGame("tetris-board");
	game.startGame();
});
