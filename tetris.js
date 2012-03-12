function TetrisGame(id) {
	this.width = 10;
	this.height = 15;
	this.canvas = new TetrisCanvas(id, this.width, this.height);
	this.board = createArray(this.width, this.height);
	
	this.doTurn = function() {
		this.canvas.drawBoard(this.board);
	}

	this.TetrisGame = function(id) {
		for (var y = 0; y < 15; y++) {
			for (var x = 0; x < 10; x++) {
				this.board[x][y] = 0;
			}
		}
	};
	this.TetrisGame(id);
}

$(document).ready(function() {
	var tetris = new TetrisGame("tetris-board");
	tetris.board[1][1] = 'I';
	tetris.doTurn();
});