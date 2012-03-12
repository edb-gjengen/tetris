$(document).ready(function() {
	var canvas = new TetrisCanvas("tetris-board");
	var board = createArray(10,15);
	
	for (var y = 0; y < 15; y++) {
		for (var x = 0; x < 10; x++) {
			board[x][y] = 0;
		}
	}
	
	board[1][1] = 'I';
	board[2][1] = 'J';
	board[3][1] = 'L';
	board[4][1] = 'O';
	board[5][1] = 'S';
	board[6][1] = 'T';
	board[7][1] = 'Z';
	canvas.drawBoard(board);
});