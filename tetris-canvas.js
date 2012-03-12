function TetrisCanvas(id) {
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
	this.sWidth = 10;
	this.sHeight = 15;

	/**************/
	/* Functions: */
	/**************/
	this.drawRectangle = function(x, y, color) {
		var topLeftCornerX = x*(this.pxSeparatorSize+this.pxRectSize);
		var topLeftCornerY = this.pxHeight - (y + 1) * (this.pxSeparatorSize + this.pxRectSize) + this.pxSeparatorSize;

		this.context.beginPath();
		this.context.rect(topLeftCornerX, topLeftCornerY, this.pxRectSize, this.pxRectSize);
		this.context.fillStyle = color;
		this.context.fill();

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
