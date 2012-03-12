function TetrisCanvas(id, width, height) {
	/***********/
	/* Colors: */
	/***********/
	this.colors = {
		  0: 'black',
		'I': 'cyan',
		'J': 'blue',
		'L': 'orange',
		'O': 'yellow',
		'S': 'green',
		'T': 'purple',
		'Z': 'red',
	};
	
	/********************/
	/* Global variables */
	/********************/

	/* Pixel-dependant: */
	this.pxWidth = -1;
	this.pxHeight = -1;
	this.pxRectSize = -1;
	this.pxSeparatorSize = 2;
	this.context = null;

	/* Segment-dependant: */
	this.sWidth = width;
	this.sHeight = height;

	/**************/
	/* Functions: */
	/**************/
	this.drawRectangle = function(x, y, brickId) {
		var topLeftCornerX = x*(this.pxSeparatorSize+this.pxRectSize);
		var topLeftCornerY = this.pxHeight - (y + 1) * (this.pxSeparatorSize + this.pxRectSize) + this.pxSeparatorSize;
		var color = this.colors[brickId];

		this.context.beginPath();
		this.context.rect(topLeftCornerX, topLeftCornerY, this.pxRectSize, this.pxRectSize);
		this.context.fillStyle = color;
		this.context.fill();

	}

	this.drawBoard = function(board) {
		for (var y = 0; y < this.sHeight; y++) {
			for (var x = 0; x < this.sWidth; x++) {
				this.drawRectangle(x,y,board[x][y]);
			}
		}
	}

	/***************/
	/* Constructor */
	/***************/
	this.TetrisCanvas = function(id) {
		var canvas = document.getElementById(id);
		this.pxHeight = $("#"+id).height();
		this.pxWidth = $("#"+id).width();
		this.pxRectSize = (this.pxWidth - (this.pxSeparatorSize * this.sWidth)) / (this.sWidth);
		
		this.context = canvas.getContext("2d");
	}
	
	this.TetrisCanvas(id);
}