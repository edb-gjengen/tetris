$(document).ready(function() {
	var canvas = new TetrisCanvas("tetris-board");
	
	canvas.drawRectangle(0,0,"blue");
	canvas.drawRectangle(1,1,"red");
	canvas.drawRectangle(2,2,"red");
	canvas.drawRectangle(3,1,"red");
});