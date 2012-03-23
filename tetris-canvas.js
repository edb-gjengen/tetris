function TetrisCanvas(canvasId, width) {
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
	this.sHeight = -1;

	/**************/
	/* Functions: */
	/**************/
	this.drawRectangle = function(x, y, brickId) {
		var topLeftCornerX = Math.floor(x*(this.pxSeparatorSize+this.pxRectSize));
		var topLeftCornerY = Math.floor(this.pxHeight - (y + 1) * (this.pxSeparatorSize + this.pxRectSize) + this.pxSeparatorSize);
		var color = this.colors[brickId];

		this.context.beginPath();
		this.context.rect(topLeftCornerX, topLeftCornerY, this.pxRectSize, this.pxRectSize);
		this.context.fillStyle = color;
		this.context.fill();

	}

	this.clearOverflow = function() {
		var topPixel = this.pxHeight - (this.sHeight * (this.pxRectSize + this.pxSeparatorSize));

		if (topPixel > 0) {
			this.context.beginPath();
			this.context.rect(0,0,this.pxWidth, topPixel);
			this.context.fillStyle = this.colors[0];
			this.context.fill();
		}
	}

	this.drawBoard = function(board) {
		this.clearOverflow();
		for (var y = 0; y < this.sHeight; y++) {
			for (var x = 0; x < this.sWidth; x++) {
				this.drawRectangle(x,y,board[x][y]);
			}
		}
	}



	/***************/
	/* Constructor */
	/***************/
	this.TetrisCanvas = function(canvasId) {
		var canvas = document.getElementById(canvasId);
		this.pxHeight = $("#"+canvasId).height();
		this.pxWidth = $("#"+canvasId).width();
		this.pxRectSize = Math.floor((this.pxWidth - (this.pxSeparatorSize * this.sWidth)) / (this.sWidth));
		
		this.sHeight = Math.floor(this.pxHeight / (this.pxRectSize + this.pxSeparatorSize));

		this.context = canvas.getContext("2d");
	}
	
	this.TetrisCanvas(canvasId);
}
