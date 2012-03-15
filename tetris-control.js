var game = null;

function doTurn() {
	document.onkeypress = onKeyPressed;
	if (game.doTurn()) {
		window.setTimeout(doTurn, 333);
	} else {
		alert('You lost!');
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
	
	if (String.fromCharCode(e.charCode) == 'w') {
		game.rotateCurrentBrick();
		return;
	}
}

$(document).ready(function() {
	game = new TetrisGame("tetris-board");
	doTurn();
});
