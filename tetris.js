/********************/
/* Global variables */
/********************/

/* Pixel-dependant: */
var pxWidth = 168;
var pxHeight = 253;
var pxSeparatorSize = 2;
var pxRectSize = 15;
var context = null;

/* Segment-dependant: */
var sWidth = 10;
var sHeight = 15;
var segments = 0; 

/**************/
/* Functions: */
/**************/
function drawRectangle(x, y, color) {
	var topLeftCornerX = x*(pxSeparatorSize+pxRectSize);
	var topLeftCornerY = pxHeight - y*(pxSeparatorSize+pxRectSize);

	context.beginPath();
	context.rect(topLeftCornerX, topLeftCornerY, pxRectSize, pxRectSize);
	context.fillStyle = color;
	context.fill();

}


/**********/
/* "Main" */
/**********/

$(document).ready(function() {
	var canvas = document.getElementById("tetris-board");
	context = canvas.getContext("2d");

	drawRectangle(0,0,"blue");
	drawRectangle(1,1,"red");
	drawRectangle(2,2,"red");
	drawRectangle(3,1,"red");
});
