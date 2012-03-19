var game = null;
var wasRecentlyRotated = false;

function initControls() {
	document.onkeypress = onKeyPressed;
	document.onkeydown = onKeyDown;
	document.onkeyup = onKeyUp;
}

function onKeyDown(e) {
	var ascii_space = 32;
	var ascii_left = 37;
	var ascii_right = 39;
	var ascii_down = 40;
	var ascii_up = 38;
	
	if (e.keyCode == ascii_space) {
		game.hardDrop();
	} else if (e.keyCode == ascii_left) {
		game.moveCurrentBrickHorizontally(-1);
	} else if (e.keyCode == ascii_right) {
		game.moveCurrentBrickHorizontally(1);
	} else if (e.keyCode == ascii_up) {
		if (! wasRecentlyRotated) {
			game.rotateCurrentBrick();
			wasRecentlyRotated = true;
		}
		return;
	} else if (e.keyCode == ascii_down) {
		game.moveCurrentBrickDown();
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
	game = new TetrisGame("tetris-board", "lines", "next-bricks");
	game.startGame();
});
